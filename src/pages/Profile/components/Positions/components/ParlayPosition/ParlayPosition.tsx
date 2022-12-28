import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { USD_SIGN } from 'constants/currency';
import { MAX_GAS_LIMIT } from 'constants/network';
import { Position } from 'constants/options';
import { ShareTicketModalProps } from 'pages/Markets/Home/Parlay/components/ShareTicketModal/ShareTicketModal';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { ParlayMarket, ParlaysMarket } from 'types/markets';
import { getEtherscanTxLink } from 'utils/etherscan';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import {
    convertPositionNameToPosition,
    convertPositionNameToPositionType,
    formatMarketOdds,
    isParlayClaimable,
} from 'utils/markets';
import networkConnector from 'utils/networkConnector';
import { refetchAfterClaim } from 'utils/queryConnector';
import ParlayItem from './components/ParlayItem';
import {
    ArrowIcon,
    CollapsableContainer,
    CollapseFooterContainer,
    Container,
    Divider,
    InfoContainer,
    InfoContainerColumn,
    OverviewContainer,
    ParlayDetailContainer,
    ProfitContainer,
    TicketId,
    TicketIdContainer,
    TotalQuoteContainer,
    Value,
    WinLabel,
    WinValue,
} from './styled-components';
import {
    ClaimContainer,
    ClaimLabel,
    ClaimValue,
    ExternalLink,
    ExternalLinkArrow,
    ExternalLinkContainer,
    Label,
    ClaimButton,
} from '../../styled-components';

type ParlayPosition = {
    parlayMarket: ParlayMarket;
    setShareTicketModalData?: (shareTicketData: ShareTicketModalProps) => void;
    setShowShareTicketModal?: (show: boolean) => void;
};

const ParlayPosition: React.FC<ParlayPosition> = ({
    parlayMarket,
    setShareTicketModalData,
    setShowShareTicketModal,
}) => {
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const selectedOddsType = useSelector(getOddsType);

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const claimParlay = async (parlayAddress: string) => {
        const id = toast.loading(t('market.toast-message.transaction-pending'));
        const { parlayMarketsAMMContract, signer } = networkConnector;
        if (signer && parlayMarketsAMMContract) {
            try {
                const parlayMarketsAMMContractWithSigner = parlayMarketsAMMContract.connect(signer);

                const tx = await parlayMarketsAMMContractWithSigner?.exerciseParlay(parlayAddress, {
                    gasLimit: MAX_GAS_LIMIT,
                });
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.claim-winnings-success')));
                    if (setShareTicketModalData && setShowShareTicketModal) {
                        setShareTicketModalData(shareParlayData);
                        setShowShareTicketModal(true);
                    }
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
            }
        }
    };

    const { t } = useTranslation();
    const isClaimable = isParlayClaimable(parlayMarket);

    const shareParlayData = {
        markets: parlayMarket.sportMarketsFromContract.map((address, index) => {
            const sportMarket = parlayMarket.sportMarkets.find(
                (market) => market.address.toLowerCase() == address.toLowerCase()
            );
            const position = parlayMarket.positions.find((position) => position.market.address == sportMarket?.address);

            return {
                ...sportMarket,
                ...(convertPositionNameToPositionType(position?.side ? position?.side : '') == Position.HOME && {
                    homeOdds: sportMarket?.isCanceled ? 1 : parlayMarket.marketQuotes[index],
                }),
                ...(convertPositionNameToPositionType(position?.side ? position?.side : '') == Position.AWAY && {
                    awayOdds: sportMarket?.isCanceled ? 1 : parlayMarket.marketQuotes[index],
                }),
                ...(convertPositionNameToPositionType(position?.side ? position?.side : '') == Position.DRAW && {
                    drawOdds: sportMarket?.isCanceled ? 1 : parlayMarket.marketQuotes[index],
                }),
                position: convertPositionNameToPosition(position?.side ? position?.side : ''),
                winning: isParlayClaimable(parlayMarket),
            } as ParlaysMarket;
        }),
        totalQuote: parlayMarket.totalQuote,
        paid: parlayMarket.sUSDPaid,
        payout: parlayMarket.totalAmount,
        onClose: () => {
            refetchAfterClaim(walletAddress, networkId);
            setShowShareTicketModal ? setShowShareTicketModal(false) : null;
        },
    };

    return (
        <Container>
            <OverviewContainer onClick={() => setShowDetails(!showDetails)}>
                <ArrowIcon className={showDetails ? 'icon icon--arrow-up' : 'icon icon--arrow-down'} />
                <TicketIdContainer>
                    <Label>{t('profile.card.ticket-id')}:</Label>
                    <TicketId>{truncateAddress(parlayMarket.id)}</TicketId>
                </TicketIdContainer>
                <InfoContainer>
                    <Label>{t('profile.card.number-of-games')}:</Label>
                    <Value>{parlayMarket.sportMarkets?.length}</Value>
                </InfoContainer>
                <InfoContainerColumn>
                    <Label>{t('profile.card.ticket-paid')}:</Label>
                    <Value>{formatCurrencyWithSign(USD_SIGN, parlayMarket.sUSDPaid)}</Value>
                </InfoContainerColumn>
                {isMobile && !isClaimable && (
                    <InfoContainerColumn>
                        <WinLabel>{t('profile.card.to-win')}:</WinLabel>
                        <WinValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</WinValue>
                    </InfoContainerColumn>
                )}
                {!isMobile && (
                    <InfoContainerColumn>
                        {isClaimable ? (
                            <ClaimLabel>{t('profile.card.to-claim')}:</ClaimLabel>
                        ) : (
                            <WinLabel>{t('profile.card.to-win')}:</WinLabel>
                        )}
                        {isClaimable ? (
                            <ClaimValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</ClaimValue>
                        ) : (
                            <WinValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</WinValue>
                        )}
                    </InfoContainerColumn>
                )}
                {isMobile && isClaimable && (
                    <ClaimContainer>
                        <ClaimValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</ClaimValue>
                        <ClaimButton
                            claimable={true}
                            onClick={(e: any) => {
                                e.preventDefault();
                                e.stopPropagation();
                                claimParlay(parlayMarket.id);
                            }}
                        >
                            {t('profile.card.claim')}
                        </ClaimButton>
                    </ClaimContainer>
                )}
                {isClaimable && !isMobile && (
                    <ClaimButton
                        claimable={true}
                        onClick={(e: any) => {
                            e.preventDefault();
                            e.stopPropagation();
                            claimParlay(parlayMarket.id);
                        }}
                    >
                        {t('profile.card.claim')}
                    </ClaimButton>
                )}
                {!isClaimable && (
                    <ExternalLink href={getEtherscanTxLink(networkId, parlayMarket.txHash)} target={'_blank'}>
                        <ExternalLinkContainer>
                            <ExternalLinkArrow style={{ right: '7px' }} />
                        </ExternalLinkContainer>
                    </ExternalLink>
                )}
            </OverviewContainer>
            <CollapsableContainer show={showDetails}>
                <Divider />
                <ParlayDetailContainer>
                    {parlayMarket.sportMarketsFromContract.map((address, index) => {
                        const sportMarket = parlayMarket.sportMarkets.find(
                            (market) => market.address.toLowerCase() == address.toLowerCase()
                        );
                        const position = parlayMarket.positions.find(
                            (position) => position.market.address == sportMarket?.address
                        );
                        if (sportMarket && position) {
                            return (
                                <ParlayItem
                                    market={sportMarket}
                                    position={position}
                                    quote={parlayMarket.marketQuotes ? parlayMarket.marketQuotes[index] : 0}
                                    key={index}
                                />
                            );
                        }
                    })}
                </ParlayDetailContainer>
                <CollapseFooterContainer>
                    <TotalQuoteContainer>
                        <Label>{t('profile.card.total-quote')}:</Label>
                        <Value>{formatMarketOdds(selectedOddsType, parlayMarket.totalQuote)}</Value>
                    </TotalQuoteContainer>
                    <ProfitContainer>
                        {isClaimable ? (
                            <ClaimLabel>{t('profile.card.to-claim')}:</ClaimLabel>
                        ) : (
                            <WinLabel>{t('profile.card.to-win')}:</WinLabel>
                        )}
                        {isClaimable ? (
                            <ClaimValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</ClaimValue>
                        ) : (
                            <WinValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</WinValue>
                        )}
                    </ProfitContainer>
                </CollapseFooterContainer>
            </CollapsableContainer>
        </Container>
    );
};

export default ParlayPosition;
