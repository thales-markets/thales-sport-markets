import Button from 'components/Button';
import SimpleLoader from 'components/SimpleLoader';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { GAS_ESTIMATION_BUFFER } from 'constants/network';
import { ethers } from 'ethers';
import { LoaderContainer } from 'pages/Markets/Home/HomeV2';
import useMarketDurationQuery from 'queries/markets/useMarketDurationQuery';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getIsStakingModalMuted, setStakingModalMuteEnd } from 'redux/modules/ui';
import { getIsConnectedViaParticle, getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { Coins } from 'thales-utils';
import { getCollateral, getCollaterals, getDefaultCollateral, isLpSupported } from 'utils/collaterals';
import networkConnector from 'utils/networkConnector';
import StakingModal from '../StakingModal';
import TicketDetails from './components/TicketDetails';
import {
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
    StakeArrow,
    StakingInfo,
    StyledParlayEmptyIcon,
    additionalClaimButtonStyle,
    additionalClaimButtonStyleMobile,
} from './styled-components';

const OpenClaimableTickets: React.FC<{ searchText?: string }> = ({ searchText }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [openClaimable, setClaimableState] = useState<boolean>(true);
    const [openOpenPositions, setOpenState] = useState<boolean>(true);
    const [openStakingModal, setOpenStakingModal] = useState<boolean>(false);
    const [forceOpenStakingModal, setForceOpenStakingModal] = useState<boolean>(false);
    const [thalesClaimed, setThalesClaimed] = useState<number>(0);

    const walletAddress = useSelector(getWalletAddress) || '';
    const isWalletConnected = useSelector(getIsWalletConnected);
    const networkId = useSelector(getNetworkId);
    const isMobile = useSelector(getIsMobile);
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
        networkId,
        {
            enabled: isWalletConnected,
        }
    );

    const marketDurationQuery = useMarketDurationQuery(networkId);

    const marketDuration =
        marketDurationQuery.isSuccess && marketDurationQuery.data ? Math.floor(marketDurationQuery.data) : 30;

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
        const { signer, sportsAMMV2Contract, multiCallContract } = networkConnector;
        const id = toast.loading(t('market.toast-message.transaction-pending'));

        if (!signer) return;

        const calls: { target: string; allowFailure: boolean; callData: any }[] = [];

        try {
            if (userTicketsByStatus.claimable.length) {
                if (sportsAMMV2Contract && multiCallContract) {
                    const multiCallContractWithSigner = multiCallContract.connect(signer);

                    let thalesForClaim = 0;
                    for (let i = 0; i < userTicketsByStatus.claimable.length; i++) {
                        const ticket = userTicketsByStatus.claimable[i];
                        try {
                            const sportsAMMV2ContractWithSigner = sportsAMMV2Contract.connect(signer);

                            const isClaimCollateralDefaultCollateral = claimCollateral === defaultCollateral;

                            const tx = await sportsAMMV2ContractWithSigner.populateTransaction.exerciseTicket(
                                ticket.id
                            );

                            if (isClaimCollateralDefaultCollateral) {
                                calls.push({
                                    target: sportsAMMV2Contract.address,
                                    allowFailure: true,
                                    callData: tx?.data,
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

                    const gasEstimation = await multiCallContractWithSigner.estimateGas.aggregate3(calls);

                    const gasEstimationWithBuffer = Math.ceil(Number(gasEstimation) * GAS_ESTIMATION_BUFFER);

                    const tx: any = await multiCallContractWithSigner.aggregate3(calls, {
                        gasLimit: gasEstimationWithBuffer,
                    });

                    const txResult = await tx.wait();

                    if (txResult && txResult?.transactionHash) {
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
            {!isParticle && (
                <StakingInfo
                    onClick={() => {
                        setForceOpenStakingModal(true);
                        dispatch(setStakingModalMuteEnd(0));
                    }}
                >
                    {t('profile.staking-modal.staking-message')}
                    <StakeArrow className="icon icon--caret-right" />
                </StakingInfo>
            )}
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
