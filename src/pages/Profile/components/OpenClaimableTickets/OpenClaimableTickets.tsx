import Button from 'components/Button';
import SimpleLoader from 'components/SimpleLoader';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { GAS_ESTIMATION_BUFFER } from 'constants/network';
import { ContractType } from 'enums/contract';
import { ethers } from 'ethers';
import { LoaderContainer } from 'pages/Markets/Home/HomeV2';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getIsStakingModalMuted } from 'redux/modules/ui';
import { getIsBiconomy, getIsConnectedViaParticle } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Coins } from 'thales-utils';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollateral, getCollaterals, getDefaultCollateral, isLpSupported } from 'utils/collaterals';
import multiCallContract from 'utils/contracts/multiCallContract';
import sportsAMMV2Contract from 'utils/contracts/sportsAMMV2Contract';
import { getContractInstance } from 'utils/networkConnector';
import { Address, Client, encodeFunctionData } from 'viem';
import { estimateContractGas, waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient } from 'wagmi';
import StakingModal from '../StakingModal';
import TicketDetails from './components/TicketDetails';
import {
    additionalClaimButtonStyle,
    additionalClaimButtonStyleMobile,
    Arrow,
    CategoryContainer,
    CategoryDisclaimer,
    CategoryIcon,
    CategoryInfo,
    CategoryLabel,
    ClaimAllContainer,
    Container,
    EmptyContainer,
    EmptySubtitle,
    EmptyTitle,
    ListContainer,
    StyledParlayEmptyIcon,
} from './styled-components';

type OpenClaimableTicketsProps = {
    searchText?: string;
    forceOpenStakingModal: boolean;
    setForceOpenStakingModal: (forceOpenStakingModal: boolean) => void;
};

const OpenClaimableTickets: React.FC<OpenClaimableTicketsProps> = ({
    searchText,
    forceOpenStakingModal,
    setForceOpenStakingModal,
}) => {
    const { t } = useTranslation();

    const [openClaimable, setClaimableState] = useState<boolean>(true);
    const [openOpenPositions, setOpenState] = useState<boolean>(true);
    const [openStakingModal, setOpenStakingModal] = useState<boolean>(false);
    const [thalesClaimed, setThalesClaimed] = useState<number>(0);

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const isStakingModalMuted = useSelector(getIsStakingModalMuted);
    const isParticle = useSelector(getIsConnectedViaParticle);

    const isSearchTextWalletAddress = searchText && ethers.utils.isAddress(searchText);
    const [claimCollateralIndex, setClaimCollateralIndex] = useState(0);

    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const claimCollateralArray = useMemo(
        () =>
            getCollaterals(networkId).filter(
                (collateral) => !isLpSupported(collateral) || collateral === defaultCollateral
            ),
        [networkId, defaultCollateral]
    );
    const claimCollateral = useMemo(() => getCollateral(networkId, claimCollateralIndex, claimCollateralArray), [
        claimCollateralArray,
        networkId,
        claimCollateralIndex,
    ]);

    const userTicketsQuery = useUserTicketsQuery(
        isSearchTextWalletAddress ? searchText : walletAddress.toLowerCase(),
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const marketDuration = Math.floor(90);

    const userTicketsByStatus = useMemo(() => {
        let userTickets = userTicketsQuery.isSuccess && userTicketsQuery.data ? userTicketsQuery.data : [];
        if (searchText && !ethers.utils.isAddress(searchText)) {
            userTickets = userTickets.filter((ticket) =>
                ticket.sportMarkets.some(
                    (market) =>
                        market.homeTeam.toLowerCase().includes(searchText.toLowerCase()) ||
                        market.awayTeam.toLowerCase().includes(searchText.toLowerCase())
                )
            );
        }

        const data = {
            open: userTickets.filter((ticket) => ticket.isOpen),
            claimable: userTickets.filter((ticket) => ticket.isClaimable),
        };
        return data;
    }, [userTicketsQuery.isSuccess, userTicketsQuery.data, searchText]);

    const isLoading = userTicketsQuery.isLoading;

    const claimBatch = async () => {
        const contracts = await Promise.all([
            getContractInstance(ContractType.SPORTS_AMM_V2, client, networkId),
            getContractInstance(ContractType.MULTICALL, client, networkId),
        ]);
        const [sportsAMMV2ContractWithSigner, multiCallContractWithSigner] = contracts;

        const id = toast.loading(t('market.toast-message.transaction-pending'));

        const calls: { target: string; allowFailure: boolean; callData: any }[] = [];

        try {
            if (userTicketsByStatus.claimable.length && sportsAMMV2ContractWithSigner && multiCallContractWithSigner) {
                if (sportsAMMV2Contract && multiCallContract) {
                    let thalesForClaim = 0;
                    for (let i = 0; i < userTicketsByStatus.claimable.length; i++) {
                        const ticket = userTicketsByStatus.claimable[i];
                        try {
                            const isClaimCollateralDefaultCollateral = claimCollateral === defaultCollateral;

                            const tx = encodeFunctionData({
                                abi: sportsAMMV2ContractWithSigner?.abi,
                                functionName: 'exerciseTicket',
                                args: [ticket.id],
                            });

                            if (isClaimCollateralDefaultCollateral) {
                                calls.push({
                                    target: sportsAMMV2ContractWithSigner.address,
                                    allowFailure: true,
                                    callData: tx,
                                });
                            }
                            thalesForClaim +=
                                ticket.collateral === (CRYPTO_CURRENCY_MAP.THALES as Coins)
                                    ? ticket.isFreeBet
                                        ? ticket.payout - ticket.buyInAmount
                                        : ticket.payout
                                    : 0;
                        } catch (e) {
                            console.log('Error ', e);
                            return;
                        }
                    }

                    const gasEstimation = await estimateContractGas(client as Client, {
                        address: multiCallContractWithSigner.address as Address,
                        abi: multiCallContractWithSigner.abi,
                        functionName: 'aggregate3',
                        args: [calls],
                    });
                    // const gasEstimation = await multiCallContractWithSigner.estimateGas.aggregate3(calls);

                    const gasEstimationWithBuffer = Math.ceil(Number(gasEstimation) * GAS_ESTIMATION_BUFFER);

                    const txHash = await multiCallContractWithSigner.write.aggregate3([calls], {
                        gasLimit: gasEstimationWithBuffer,
                    });

                    const txReceipt = await waitForTransactionReceipt(client as Client, {
                        hash: txHash,
                    });

                    if (txReceipt.status === 'success') {
                        toast.update(id, getSuccessToastOptions(t('market.toast-message.claim-winnings-success')));
                        onThalesClaim(thalesForClaim);
                    }
                }
            }
        } catch (e) {
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
            console.log('Error ', e);
            return;
        }
    };

    const onThalesClaim = (amount: number) => {
        setOpenStakingModal(!isStakingModalMuted && !isParticle && amount > 0);
        setThalesClaimed(amount);
    };

    return (
        <Container>
            <CategoryContainer onClick={() => setClaimableState(!openClaimable)}>
                <CategoryInfo>
                    <CategoryIcon className="icon icon--claimable-ticket" />
                    <CategoryLabel>{t('profile.categories.claimable')}</CategoryLabel>
                </CategoryInfo>
                <CategoryDisclaimer>
                    <Trans i18nKey="profile.winnings-are-forfeit" values={{ amount: marketDuration }} />
                </CategoryDisclaimer>
                <Arrow className={openClaimable ? 'icon icon--caret-up' : 'icon icon--caret-down'} />
            </CategoryContainer>
            {openClaimable && (
                <ListContainer>
                    {isLoading ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        <>
                            {userTicketsByStatus.claimable.length ? (
                                <>
                                    <ClaimAllContainer>
                                        <Button
                                            onClick={(e: any) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                claimBatch();
                                            }}
                                            additionalStyles={
                                                isMobile ? additionalClaimButtonStyleMobile : additionalClaimButtonStyle
                                            }
                                            padding="2px 5px"
                                            fontSize={isMobile ? '9px' : undefined}
                                            height={isMobile ? '19px' : '24px'}
                                        >
                                            {t('profile.card.claim-all')}
                                        </Button>
                                        <Tooltip overlay={t('profile.card.claim-batch-tooltip')} />
                                    </ClaimAllContainer>
                                    {userTicketsByStatus.claimable.map((parlayMarket, index) => {
                                        return (
                                            <TicketDetails
                                                ticket={parlayMarket}
                                                key={index}
                                                claimCollateralIndex={claimCollateralIndex}
                                                setClaimCollateralIndex={setClaimCollateralIndex}
                                                onThalesClaim={onThalesClaim}
                                            />
                                        );
                                    })}
                                </>
                            ) : (
                                <EmptyContainer>
                                    <EmptyTitle>{t('profile.messages.no-claimable')}</EmptyTitle>
                                    <StyledParlayEmptyIcon />
                                    <EmptySubtitle>{t('profile.messages.ticket-subtitle')}</EmptySubtitle>
                                </EmptyContainer>
                            )}
                        </>
                    )}
                </ListContainer>
            )}
            <CategoryContainer onClick={() => setOpenState(!openOpenPositions)}>
                <CategoryInfo>
                    <CategoryIcon className="icon icon--open-ticket" />
                    <CategoryLabel>{t('profile.categories.open')}</CategoryLabel>
                </CategoryInfo>
                <Arrow className={openOpenPositions ? 'icon icon--caret-up' : 'icon icon--caret-down'} />
            </CategoryContainer>
            {openOpenPositions && (
                <ListContainer>
                    {userTicketsQuery.isLoading ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        <>
                            {userTicketsByStatus.open.length ? (
                                <>
                                    {userTicketsByStatus.open.map((parlayMarket, index) => {
                                        return (
                                            <TicketDetails
                                                ticket={parlayMarket}
                                                key={index}
                                                claimCollateralIndex={claimCollateralIndex}
                                                setClaimCollateralIndex={setClaimCollateralIndex}
                                                onThalesClaim={onThalesClaim}
                                            />
                                        );
                                    })}
                                </>
                            ) : (
                                <EmptyContainer>
                                    <EmptyTitle>{t('profile.messages.no-open')}</EmptyTitle>
                                    <StyledParlayEmptyIcon />
                                    <EmptySubtitle>{t('profile.messages.ticket-subtitle')}</EmptySubtitle>
                                </EmptyContainer>
                            )}
                        </>
                    )}
                </ListContainer>
            )}
            {((openStakingModal && thalesClaimed > 0) || forceOpenStakingModal) && !isStakingModalMuted && !isParticle && (
                <StakingModal
                    defaultAmount={thalesClaimed}
                    onClose={() => {
                        setForceOpenStakingModal(false);
                        setOpenStakingModal(false);
                        setThalesClaimed(0);
                    }}
                />
            )}
        </Container>
    );
};

export default OpenClaimableTickets;
