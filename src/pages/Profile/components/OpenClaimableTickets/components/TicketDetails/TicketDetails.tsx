import liveAnimationData from 'assets/lotties/live-markets-filter.json';
import Button from 'components/Button/Button';
import CollateralSelector from 'components/CollateralSelector';
import ShareTicketModalV2 from 'components/ShareTicketModalV2';
import { ShareTicketModalProps } from 'components/ShareTicketModalV2/ShareTicketModalV2';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ZERO_ADDRESS } from 'constants/network';
import Lottie from 'lottie-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getTicketPayment } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { getIsAA, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { formatCurrencyWithKey, getEtherscanAddressLink, truncateAddress } from 'thales-utils';
import { Ticket } from 'types/markets';
import { executeBiconomyTransaction } from 'utils/biconomy';
import {
    getCollateral,
    getCollateralAddress,
    getCollaterals,
    getDefaultCollateral,
    isLpSupported,
} from 'utils/collaterals';
import { getIsMultiCollateralSupported } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { refetchAfterClaim } from 'utils/queryConnector';
import { formatTicketOdds, getTicketMarketOdd } from 'utils/tickets';
import TicketMarketDetails from '../TicketMarketDetails';
import {
    ArrowIcon,
    ClaimContainer,
    CollapsableContainer,
    CollapseFooterContainer,
    CollateralSelectorContainer,
    Container,
    ExternalLink,
    InfoContainerColumn,
    Label,
    LiveIndicatorContainer,
    NumberOfGamesContainer,
    OverviewContainer,
    PayoutInLabel,
    TicketIdContainer,
    TicketMarketsContainer,
    TotalQuoteContainer,
    Value,
    WinLabel,
    WinValue,
    additionalClaimButtonStyle,
    additionalClaimButtonStyleMobile,
    liveBlinkStyle,
} from './styled-components';

type TicketDetailsProps = {
    ticket: Ticket;
};

const TicketDetails: React.FC<TicketDetailsProps> = ({ ticket }) => {
    const { t } = useTranslation();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isAA = useSelector((state: RootState) => getIsAA(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const ticketPayment = useSelector(getTicketPayment);
    const selectedCollateralIndex = ticketPayment.selectedCollateralIndex;

    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps | undefined>(undefined);

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const collateralAddress = useMemo(() => getCollateralAddress(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);

    const isDefaultCollateral = selectedCollateral === defaultCollateral;
    const ticketCollateralHasLp = isLpSupported(ticket.collateral);
    const isTicketCollateralDefaultCollateral = ticket.collateral === defaultCollateral;
    const isEth = collateralAddress === ZERO_ADDRESS;

    const isClaimable = ticket.isClaimable;

    const claimTicket = async (parlayAddress: string) => {
        const id = toast.loading(t('market.toast-message.transaction-pending'));
        const { sportsAMMV2Contract, signer } = networkConnector;
        if (signer && sportsAMMV2Contract) {
            setIsSubmitting(true);
            try {
                let txResult;
                const sportsAMMV2ContractWithSigner = sportsAMMV2Contract.connect(signer);
                if (isAA) {
                    txResult =
                        isDefaultCollateral || (ticketCollateralHasLp && !isTicketCollateralDefaultCollateral)
                            ? await executeBiconomyTransaction(
                                  collateralAddress,
                                  sportsAMMV2ContractWithSigner,
                                  'exerciseTicket',
                                  [parlayAddress]
                              )
                            : await executeBiconomyTransaction(
                                  collateralAddress,
                                  sportsAMMV2ContractWithSigner,
                                  'exerciseTicketOffRamp',
                                  [parlayAddress, collateralAddress, isEth]
                              );
                } else {
                    const tx =
                        isDefaultCollateral || (ticketCollateralHasLp && !isTicketCollateralDefaultCollateral)
                            ? await sportsAMMV2ContractWithSigner.exerciseTicket(parlayAddress)
                            : await sportsAMMV2ContractWithSigner.exerciseTicketOffRamp(
                                  parlayAddress,
                                  collateralAddress,
                                  isEth
                              );
                    txResult = await tx.wait();
                }

                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.claim-winnings-success')));
                    if (setShareTicketModalData && setShowShareTicketModal) {
                        setShareTicketModalData(shareTicketData);
                        setShowShareTicketModal(true);
                    }
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
            }
            setIsSubmitting(false);
        }
    };

    const shareTicketData = {
        markets: ticket.sportMarkets.map((sportMarket) => {
            return {
                ...sportMarket,
                odd: getTicketMarketOdd(sportMarket),
            };
        }),
        paid: ticket.buyInAmount,
        payout: ticket.payout,
        multiSingle: false,
        onClose: () => {
            refetchAfterClaim(walletAddress, networkId);
            setShowShareTicketModal ? setShowShareTicketModal(false) : null;
        },
        isTicketLost: ticket.isLost,
        isTicketResolved: ticket.isResolved,
    };

    const getClaimButton = (isMobile: boolean) => (
        <Button
            disabled={isSubmitting}
            additionalStyles={isMobile ? additionalClaimButtonStyleMobile : additionalClaimButtonStyle}
            padding="2px 5px"
            fontSize={isMobile ? '9px' : '15px'}
            height={isMobile ? '19px' : '24px'}
            onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                claimTicket(ticket.id);
            }}
        >
            {isSubmitting ? t('profile.card.claim-progress') : t('profile.card.claim')}
        </Button>
    );

    const getButton = (isMobile: boolean) => {
        return getClaimButton(isMobile);
    };

    console.log(ticket);
    return (
        <Container>
            <OverviewContainer onClick={() => setShowDetails(!showDetails)}>
                {ticket.isLive ? (
                    <LiveIndicatorContainer>
                        <Lottie autoplay={true} animationData={liveAnimationData} loop={true} style={liveBlinkStyle} />
                    </LiveIndicatorContainer>
                ) : (
                    <LiveIndicatorContainer />
                )}
                <ExternalLink href={getEtherscanAddressLink(networkId, ticket.id)} target={'_blank'}>
                    <TicketIdContainer>
                        <Label>{t('profile.card.ticket-id')}:</Label>
                        <Value>{truncateAddress(ticket.id)}</Value>
                    </TicketIdContainer>
                </ExternalLink>
                <NumberOfGamesContainer>
                    <Label>{t('profile.card.number-of-games')}:</Label>
                    <Value>{ticket.numOfMarkets}</Value>
                </NumberOfGamesContainer>
                <InfoContainerColumn>
                    <Label>{t('profile.card.ticket-paid')}:</Label>
                    <Value>{formatCurrencyWithKey(ticket.collateral, ticket.buyInAmount)}</Value>
                </InfoContainerColumn>
                {isMobile && !isClaimable && (
                    <InfoContainerColumn>
                        <WinLabel>{t('profile.card.payout')}:</WinLabel>
                        <WinValue>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</WinValue>
                    </InfoContainerColumn>
                )}
                {!isMobile && (
                    <>
                        <InfoContainerColumn>
                            <WinLabel>{t('profile.card.payout')}:</WinLabel>
                            <WinValue>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</WinValue>
                        </InfoContainerColumn>
                        {isClaimable && isMultiCollateralSupported && (
                            <InfoContainerColumn
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                {(!ticketCollateralHasLp || isTicketCollateralDefaultCollateral) && (
                                    <>
                                        <WinLabel>{t('profile.card.payout-in')}:</WinLabel>
                                        <CollateralSelector
                                            collateralArray={getCollaterals(networkId)}
                                            selectedItem={selectedCollateralIndex}
                                            onChangeCollateral={() => {}}
                                        />
                                    </>
                                )}
                            </InfoContainerColumn>
                        )}
                    </>
                )}
                {isMobile && isClaimable && (
                    <ClaimContainer>
                        <WinValue>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</WinValue>
                        {getButton(isMobile)}
                        {isMultiCollateralSupported && (
                            <CollateralSelectorContainer
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <PayoutInLabel>{t('profile.card.payout-in')}:</PayoutInLabel>
                                <CollateralSelector
                                    collateralArray={getCollaterals(networkId)}
                                    selectedItem={selectedCollateralIndex}
                                    onChangeCollateral={() => {}}
                                />
                            </CollateralSelectorContainer>
                        )}
                    </ClaimContainer>
                )}
                {isClaimable && !isMobile && getButton(isMobile)}
                <ArrowIcon className={showDetails ? 'icon icon--caret-up' : 'icon icon--caret-down'} />
            </OverviewContainer>
            <CollapsableContainer show={showDetails}>
                <TicketMarketsContainer>
                    {ticket.sportMarkets.map((market, index) => {
                        return <TicketMarketDetails market={market} key={index} />;
                    })}
                </TicketMarketsContainer>
                <CollapseFooterContainer>
                    <TotalQuoteContainer>
                        <Label>{t('profile.card.total-quote')}:</Label>
                        <Value>{formatTicketOdds(selectedOddsType, ticket.buyInAmount, ticket.payout)}</Value>
                    </TotalQuoteContainer>
                </CollapseFooterContainer>
            </CollapsableContainer>
            {showShareTicketModal && shareTicketModalData && (
                <ShareTicketModalV2
                    markets={shareTicketModalData.markets}
                    multiSingle={false}
                    paid={shareTicketModalData.paid}
                    payout={shareTicketModalData.payout}
                    onClose={shareTicketModalData.onClose}
                    isTicketLost={shareTicketModalData.isTicketLost}
                    isTicketResolved={shareTicketModalData.isTicketResolved}
                />
            )}
        </Container>
    );
};

export default TicketDetails;
