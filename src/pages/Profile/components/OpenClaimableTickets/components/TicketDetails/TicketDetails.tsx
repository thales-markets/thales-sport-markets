import Button from 'components/Button/Button';
import CollateralSelector from 'components/CollateralSelector';
import ShareTicketModalV2 from 'components/ShareTicketModalV2';
import { ShareTicketModalProps } from 'components/ShareTicketModalV2/ShareTicketModalV2';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { ZERO_ADDRESS } from 'constants/network';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { getIsAA, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Coins, formatCurrencyWithKey, getEtherscanAddressLink, truncateAddress } from 'thales-utils';
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
    FreeBetIcon,
    FreeBetWrapper,
    InfoContainerColumn,
    Label,
    LiveSystemIndicatorContainer,
    NumberOfGamesContainer,
    OverviewContainer,
    OverviewWrapper,
    PayoutInLabel,
    PayoutWrapper,
    TicketIdContainer,
    TicketInfo,
    TicketMarketsContainer,
    TotalQuoteContainer,
    TwitterIcon,
    TwitterWrapper,
    Value,
    WinLabel,
    WinValue,
    additionalClaimButtonStyle,
    additionalClaimButtonStyleMobile,
} from './styled-components';

type TicketDetailsProps = {
    ticket: Ticket;
    claimCollateralIndex: number;
    setClaimCollateralIndex: any;
    onThalesClaim: (thalesClaimed: number) => void;
};

const TicketDetails: React.FC<TicketDetailsProps> = ({
    ticket,
    claimCollateralIndex,
    setClaimCollateralIndex,
    onThalesClaim,
}) => {
    const { t } = useTranslation();
    const selectedOddsType = useSelector(getOddsType);
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isAA = useSelector((state: RootState) => getIsAA(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps | undefined>(undefined);

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);

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
    const claimCollateralAddress = useMemo(
        () => getCollateralAddress(networkId, claimCollateralIndex, claimCollateralArray),
        [networkId, claimCollateralIndex, claimCollateralArray]
    );

    const ticketCollateralHasLp = isLpSupported(ticket.collateral);
    const isTicketCollateralDefaultCollateral = ticket.collateral === defaultCollateral;
    const isClaimCollateralDefaultCollateral = claimCollateral === defaultCollateral;
    const isEth = claimCollateralAddress === ZERO_ADDRESS;

    const isClaimable = ticket.isClaimable;

    const claimTicket = async (ticketAddress: string) => {
        const id = toast.loading(t('market.toast-message.transaction-pending'));
        const { sportsAMMV2Contract, signer } = networkConnector;
        if (signer && sportsAMMV2Contract) {
            setIsSubmitting(true);
            try {
                let txResult;
                const sportsAMMV2ContractWithSigner = sportsAMMV2Contract.connect(signer);
                if (isAA) {
                    txResult =
                        isClaimCollateralDefaultCollateral ||
                        (ticketCollateralHasLp && !isTicketCollateralDefaultCollateral) ||
                        ticket.isFreeBet
                            ? await executeBiconomyTransaction(
                                  claimCollateralAddress,
                                  sportsAMMV2ContractWithSigner,
                                  'exerciseTicket',
                                  [ticketAddress]
                              )
                            : await executeBiconomyTransaction(
                                  claimCollateralAddress,
                                  sportsAMMV2ContractWithSigner,
                                  'exerciseTicketOffRamp',
                                  [ticketAddress, claimCollateralAddress, isEth]
                              );
                } else {
                    const tx =
                        isClaimCollateralDefaultCollateral ||
                        (ticketCollateralHasLp && !isTicketCollateralDefaultCollateral) ||
                        ticket.isFreeBet
                            ? await sportsAMMV2ContractWithSigner.exerciseTicket(ticketAddress)
                            : await sportsAMMV2ContractWithSigner.exerciseTicketOffRamp(
                                  ticketAddress,
                                  claimCollateralAddress,
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
                    if (ticket.collateral === (CRYPTO_CURRENCY_MAP.THALES as Coins)) {
                        onThalesClaim(ticket.isFreeBet ? ticket.payout - ticket.buyInAmount : ticket.payout);
                    }
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
            }
            setIsSubmitting(false);
        }
    };

    const onTwitterIconClick = () => {
        setShareTicketModalData(shareTicketData);
        setShowShareTicketModal(true);
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
        collateral: ticket.collateral,
        isLive: ticket.isLive,
        applyPayoutMultiplier: false,
    };

    const getClaimButton = (isMobile: boolean) => {
        return ticket.isFreeBet ? (
            <Tooltip
                overlay={t('profile.free-bet.claim-btn')}
                component={
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
                }
            />
        ) : (
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
    };

    const getButton = (isMobile: boolean) => {
        return getClaimButton(isMobile);
    };

    return (
        <Container>
            <OverviewWrapper>
                <LiveSystemIndicatorContainer isLive={ticket.isLive} isSystem={ticket.isSystem}>
                    {ticket.isLive ? (
                        <Label>{t('profile.card.live')}</Label>
                    ) : ticket.isSystem ? (
                        <Label>{t('profile.card.system')}</Label>
                    ) : (
                        <></>
                    )}
                </LiveSystemIndicatorContainer>
                <OverviewContainer onClick={() => setShowDetails(!showDetails)}>
                    <TicketInfo>
                        <ExternalLink href={getEtherscanAddressLink(networkId, ticket.id)} target={'_blank'}>
                            <TicketIdContainer>
                                <Label>{t('profile.card.ticket-id')}:</Label>
                                <Value>{truncateAddress(ticket.id)}</Value>
                            </TicketIdContainer>
                        </ExternalLink>
                        <NumberOfGamesContainer>
                            <Label>
                                {ticket.isSystem ? t('profile.card.system') : t('profile.card.number-of-games')}:
                            </Label>
                            <Value>{`${ticket.isSystem ? 'X/' : ''}${ticket.numOfMarkets}`}</Value>
                        </NumberOfGamesContainer>
                    </TicketInfo>
                    <InfoContainerColumn isOpen={!isClaimable}>
                        <Label>{t('profile.card.ticket-paid')}:</Label>
                        <Value>{formatCurrencyWithKey(ticket.collateral, ticket.buyInAmount)}</Value>
                    </InfoContainerColumn>
                    {isMobile && !isClaimable && (
                        <PayoutWrapper>
                            {ticket.isFreeBet && (
                                <FreeBetWrapper>
                                    <FreeBetIcon className={'icon icon--gift'} />
                                </FreeBetWrapper>
                            )}
                            <InfoContainerColumn isOpen={!isClaimable}>
                                <WinLabel>{t('profile.card.payout')}:</WinLabel>
                                <WinValue>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</WinValue>
                            </InfoContainerColumn>
                        </PayoutWrapper>
                    )}
                    {!isMobile && (
                        <>
                            <PayoutWrapper>
                                {ticket.isFreeBet && (
                                    <FreeBetWrapper>
                                        <Tooltip
                                            overlay={t('profile.free-bet.claim-btn')}
                                            component={<FreeBetIcon className={'icon icon--gift'} />}
                                        />
                                    </FreeBetWrapper>
                                )}
                                <InfoContainerColumn isOpen={!isClaimable}>
                                    <WinLabel>{t('profile.card.payout')}:</WinLabel>
                                    <WinValue>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</WinValue>
                                </InfoContainerColumn>
                            </PayoutWrapper>
                            {isClaimable && isMultiCollateralSupported && !ticket.isFreeBet && (
                                <InfoContainerColumn
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    {isTicketCollateralDefaultCollateral && (
                                        <>
                                            <WinLabel>{t('profile.card.payout-in')}:</WinLabel>
                                            <CollateralSelector
                                                collateralArray={claimCollateralArray}
                                                selectedItem={claimCollateralIndex}
                                                onChangeCollateral={setClaimCollateralIndex}
                                                preventPaymentCollateralChange
                                            />
                                        </>
                                    )}
                                </InfoContainerColumn>
                            )}
                        </>
                    )}
                    {isMobile && isClaimable && (
                        <>
                            <ClaimContainer>
                                <WinValue>{formatCurrencyWithKey(ticket.collateral, ticket.payout)}</WinValue>
                                {getButton(isMobile)}
                                {isMultiCollateralSupported &&
                                    isTicketCollateralDefaultCollateral &&
                                    !ticket.isFreeBet && (
                                        <CollateralSelectorContainer
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            <PayoutInLabel>{t('profile.card.payout-in')}:</PayoutInLabel>
                                            <CollateralSelector
                                                collateralArray={claimCollateralArray}
                                                selectedItem={claimCollateralIndex}
                                                onChangeCollateral={setClaimCollateralIndex}
                                                preventPaymentCollateralChange
                                            />
                                        </CollateralSelectorContainer>
                                    )}
                            </ClaimContainer>
                            {ticket.isFreeBet && (
                                <FreeBetWrapper>
                                    <FreeBetIcon className={'icon icon--gift'} />
                                </FreeBetWrapper>
                            )}
                        </>
                    )}
                    {isClaimable && !isMobile && getButton(isMobile)}
                    <ArrowIcon className={showDetails ? 'icon icon--caret-up' : 'icon icon--caret-down'} />
                </OverviewContainer>
            </OverviewWrapper>
            <CollapsableContainer show={showDetails}>
                <TicketMarketsContainer>
                    {ticket.sportMarkets.map((market, index) => {
                        return <TicketMarketDetails market={market} key={index} isLive={ticket.isLive} />;
                    })}
                </TicketMarketsContainer>
                <CollapseFooterContainer>
                    <TotalQuoteContainer>
                        <Label>{t('profile.card.total-quote')}:</Label>
                        <Value>{formatTicketOdds(selectedOddsType, ticket.buyInAmount, ticket.payout)}</Value>
                    </TotalQuoteContainer>
                    <TwitterWrapper>
                        <TwitterIcon onClick={() => onTwitterIconClick()} />
                    </TwitterWrapper>
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
                    collateral={shareTicketModalData.collateral}
                    isLive={shareTicketModalData.isLive}
                    applyPayoutMultiplier={shareTicketModalData.applyPayoutMultiplier}
                />
            )}
        </Container>
    );
};

export default TicketDetails;
