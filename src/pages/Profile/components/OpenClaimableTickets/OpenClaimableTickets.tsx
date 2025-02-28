import Button from 'components/Button';
import SimpleLoader from 'components/SimpleLoader';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { GAS_ESTIMATION_BUFFER_CLAIM_ALL } from 'constants/network';
import { ContractType } from 'enums/contract';
import { LoaderContainer } from 'pages/Markets/Home/HomeV2';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import { RootState } from 'types/redux';
import biconomyConnector from 'utils/biconomyWallet';
import { getCollateral, getCollaterals, getDefaultCollateral, isLpSupported } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import multiCallContract from 'utils/contracts/multiCallContract';
import sportsAMMV2Contract from 'utils/contracts/sportsAMMV2Contract';
import { Address, Client, encodeFunctionData, isAddress } from 'viem';
import { estimateContractGas, waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
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
};

const OpenClaimableTickets: React.FC<OpenClaimableTicketsProps> = ({ searchText }) => {
    const { t } = useTranslation();

    const [openClaimable, setClaimableState] = useState<boolean>(true);
    const [openOpenPositions, setOpenState] = useState<boolean>(true);

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();

    const { address, isConnected } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const isSearchTextWalletAddress = searchText && isAddress(searchText);
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
        isSearchTextWalletAddress ? searchText : walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const marketDuration = Math.floor(90);

    const userTicketsByStatus = useMemo(() => {
        let userTickets = userTicketsQuery.isSuccess && userTicketsQuery.data ? userTicketsQuery.data : [];
        if (searchText && !isAddress(searchText)) {
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
        const sportsAMMV2ContractWithSigner = getContractInstance(ContractType.SPORTS_AMM_V2, {
            client: walletClient?.data,
            networkId,
        });
        const multiCallContractWithSigner = getContractInstance(ContractType.MULTICALL, {
            client: walletClient?.data,
            networkId,
        });

        const id = toast.loading(t('market.toast-message.transaction-pending'));

        const calls: { target: string; allowFailure: boolean; callData: any }[] = [];

        try {
            if (userTicketsByStatus.claimable.length && sportsAMMV2ContractWithSigner && multiCallContractWithSigner) {
                if (sportsAMMV2Contract && multiCallContract) {
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
                    const gasEstimationWithBuffer = BigInt(
                        Math.ceil(Number(gasEstimation) * GAS_ESTIMATION_BUFFER_CLAIM_ALL)
                    );

                    const txHash = await multiCallContractWithSigner.write.aggregate3([calls], {
                        gas: gasEstimationWithBuffer,
                    });

                    const txReceipt = await waitForTransactionReceipt(client as Client, {
                        hash: txHash,
                    });

                    if (txReceipt.status === 'success') {
                        toast.update(id, getSuccessToastOptions(t('market.toast-message.claim-winnings-success')));
                    }
                }
            }
        } catch (e) {
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
            console.log('Error ', e);
            return;
        }
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
                                        <Tooltip
                                            overlay={t('profile.card.claim-batch-tooltip')}
                                            iconFontSize={isMobile ? 16 : 20}
                                            marginLeft={12}
                                            top={-2}
                                        />
                                    </ClaimAllContainer>
                                    {userTicketsByStatus.claimable.map((parlayMarket, index) => {
                                        return (
                                            <TicketDetails
                                                ticket={parlayMarket}
                                                key={index}
                                                claimCollateralIndex={claimCollateralIndex}
                                                setClaimCollateralIndex={setClaimCollateralIndex}
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
        </Container>
    );
};

export default OpenClaimableTickets;
