import SPAAnchor from 'components/SPAAnchor';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { USD_SIGN } from 'constants/currency';
import { ClaimButton } from 'pages/Markets/Market/MarketDetailsV2/components/Positions/styled-components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivRow } from 'styles/common';
import { ParlayMarket } from 'types/markets';
import { getEtherscanAddressLink } from 'utils/etherscan';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import { formatMarketOdds, isParlayClaimable } from 'utils/markets';
import networkConnector from 'utils/networkConnector';
import { refetchAfterClaim } from 'utils/queryConnector';
import ParlayItem from './components/ParlayItem';
import {
    ArrowIcon,
    ClaimContainer,
    ClaimLabel,
    ClaimValue,
    CollapsableContainer,
    CollapseFooterContainer,
    Container,
    Divider,
    ExternalLinkArrow,
    ExternalLinkContainer,
    InfoContainer,
    InfoContainerColumn,
    Label,
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

type ParlayPosition = {
    parlayMarket: ParlayMarket;
};

const ParlayPosition: React.FC<ParlayPosition> = ({ parlayMarket }) => {
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const selectedOddsType = useSelector(getOddsType);

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const claimParlay = async (parlayAddress: string) => {
        const id = toast.loading(t('market.toast-messsage.transaction-pending'));
        const { parlayMarketsAMMContract, signer } = networkConnector;
        if (signer && parlayMarketsAMMContract) {
            try {
                const parlayMarketsAMMContractWithSigner = parlayMarketsAMMContract.connect(signer);

                const tx = await parlayMarketsAMMContractWithSigner?.exerciseParlay(parlayAddress);
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('market.toast-messsage.claim-winnings-success')));
                    refetchAfterClaim(walletAddress, networkId);
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
            }
        }
    };

    const { t } = useTranslation();
    const isClaimable = isParlayClaimable(parlayMarket);

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
                {/* {!isMobile && ( */}
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
                {/* )} */}
                {isMobile && isClaimable && (
                    <ClaimContainer>
                        <FlexDivRow>
                            <ClaimLabel>{t('profile.card.to-claim')}:</ClaimLabel>
                            <ClaimValue>{formatCurrencyWithSign(USD_SIGN, parlayMarket.totalAmount)}</ClaimValue>
                        </FlexDivRow>
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
                    <SPAAnchor href={getEtherscanAddressLink(networkId, parlayMarket.id)}>
                        <ExternalLinkContainer>
                            <ExternalLinkArrow style={{ right: '7px' }} />
                        </ExternalLinkContainer>
                    </SPAAnchor>
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
