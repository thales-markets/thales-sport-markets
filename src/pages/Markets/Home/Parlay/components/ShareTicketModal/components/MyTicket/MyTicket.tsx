import { ReactComponent as OvertimeLogoIcon } from 'assets/images/overtime-logo.svg';
import { USD_SIGN } from 'constants/currency';
import { t } from 'i18next';
import React from 'react';
import QRCode from 'react-qr-code';
import { useSelector } from 'react-redux';
import { getOddsType } from 'redux/modules/ui';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import {
    FlexDiv,
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivRow,
    FlexDivRowCentered,
} from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { formatMarketOdds } from 'utils/markets';
import { generateReferralLink } from 'utils/referral';
import MatchInfo from '../../../MatchInfo';

type MyTicketProps = {
    markets: ParlaysMarket[];
    totalQuote: number;
    paid: number;
    payout: number;
};

const MyTicket: React.FC<MyTicketProps> = ({ markets, totalQuote, paid, payout }) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const selectedOddsType = useSelector(getOddsType);

    const isTicketLost = markets.some((market) => market.isResolved && !market.winning);
    const isTicketResolved = markets.every((market) => market.isResolved || market.isCanceled) || isTicketLost;
    const isParlay = markets.length > 1;

    return (
        <Container>
            <ContentRow>
                <OvertimeLogo />
                {isParlay && <ParlayLabel>{t('markets.parlay.share-ticket.parlay')}</ParlayLabel>}
                {!isParlay && (
                    <Header isParlay={isParlay}>
                        {t('markets.parlay.share-ticket.header')}
                        <BoldContent>{' overtimemarkets.xyz'}</BoldContent>
                    </Header>
                )}
            </ContentRow>
            {isParlay && (
                <Header isParlay={isParlay}>
                    {t('markets.parlay.share-ticket.header')}
                    <BoldContent>{' overtimemarkets.xyz'}</BoldContent>
                </Header>
            )}
            <ContentRow margin={'3px 0'}>
                <ReferralWrapper>
                    <QRCode size={70} value={generateReferralLink(walletAddress)} />
                    <ReferralLabel>{t('markets.parlay.share-ticket.referral')}</ReferralLabel>
                </ReferralWrapper>
                <PayoutWrapper>
                    <PayoutRow>
                        <Square isLost={isTicketLost} isResolved={isTicketResolved} />
                        <PayoutLabel isLost={isTicketLost} isResolved={isTicketResolved}>
                            {isTicketResolved
                                ? t('markets.parlay.payout')
                                : t('markets.parlay.share-ticket.potential-payout')}
                        </PayoutLabel>
                        <Square isLost={isTicketLost} isResolved={isTicketResolved} />
                    </PayoutRow>
                    <PayoutRow>
                        <PayoutValue isLost={isTicketLost} isResolved={isTicketResolved}>
                            {formatCurrencyWithSign(USD_SIGN, payout)}
                        </PayoutValue>
                    </PayoutRow>
                </PayoutWrapper>
            </ContentRow>
            <HorizontalLine />
            <MarketsContainer>
                {markets.map((market, index) => {
                    return (
                        <React.Fragment key={index}>
                            <RowMarket>
                                <MatchInfo
                                    market={market}
                                    readOnly={true}
                                    isHighlighted={true}
                                    customStyle={matchInfoStyle}
                                />
                            </RowMarket>
                            {markets.length !== index + 1 && <HorizontalDashedLine />}
                        </React.Fragment>
                    );
                })}
            </MarketsContainer>
            <HorizontalLine />
            <InfoWrapper>
                <InfoDiv>
                    <InfoLabel>{t('markets.parlay.share-ticket.total-quote')}:</InfoLabel>
                    <InfoValue>{formatMarketOdds(selectedOddsType, totalQuote)}</InfoValue>
                </InfoDiv>
                <InfoDiv>
                    <InfoLabel>{t('markets.parlay.buy-in')}:</InfoLabel>
                    <InfoValue>{formatCurrencyWithSign(USD_SIGN, paid, 2)}</InfoValue>
                </InfoDiv>
            </InfoWrapper>
        </Container>
    );
};

const matchInfoStyle = { fontSize: '11px', lineHeight: '13px' };

const Container = styled(FlexDivColumnCentered)`
    align-items: center;
`;

const ContentRow = styled(FlexDivRowCentered)<{ margin?: string }>`
    width: 294px;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

const MarketsContainer = styled(FlexDivColumn)`
    width: 100%;
`;

const Header = styled.span<{ isParlay: boolean }>`
    font-weight: 200;
    font-size: ${(props) => (props.isParlay ? '11' : '10')}px;
    line-height: ${(props) => (props.isParlay ? '13' : '12')}px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.045em;
    color: #ffffff;
    ${(props) => (props.isParlay ? 'white-space: nowrap;' : '')};
    ${(props) => (props.isParlay ? 'margin-top: 3px' : '')};
`;

const BoldContent = styled.span`
    font-weight: 900;
`;

const ParlayLabel = styled.span`
    font-size: 34px;
    line-height: 27px;
    letter-spacing: 0.1em;
    font-weight: 300;
    text-transform: uppercase;
    color: #ffffff;
    padding-left: 5px;
    opacity: 0.8;
`;

const OvertimeLogo = styled(OvertimeLogoIcon)`
    fill: ${(props) => props.theme.textColor.primary};
`;

const PayoutWrapper = styled.div`
    width: 100%;
    text-align: center;
    text-transform: uppercase;
`;

const PayoutRow = styled(FlexDivCentered)``;

const PayoutLabel = styled.span<{ isLost?: boolean; isResolved?: boolean }>`
    font-size: ${(props) => (props.isResolved ? '32' : '18')}px;
    line-height: ${(props) => (props.isResolved ? '32' : '18')}px;
    font-weight: 200;
    padding: 0 5px;
    color: ${(props) => (props.isLost ? '#ca4c53' : '#5fc694')};
    ${(props) => (props.isLost ? 'text-decoration: line-through 2px solid #ca4c53;' : '')};
`;

const Square = styled.div<{ isLost?: boolean; isResolved?: boolean }>`
    width: ${(props) => (props.isResolved ? '10' : '8')}px;
    height: ${(props) => (props.isResolved ? '10' : '8')}px;
    transform: rotate(-45deg);
    background: ${(props) => (props.isLost ? '#ca4c53' : '#5fc694')};
`;

const PayoutValue = styled.span<{ isLost?: boolean; isResolved?: boolean }>`
    font-size: ${(props) => (props.isResolved ? '35' : '30')}px;
    line-height: ${(props) => (props.isResolved ? '37' : '32')}px;
    font-weight: 800;
    color: ${(props) => (props.isLost ? '#ca4c53' : '#5fc694')};
    ${(props) => (props.isLost ? 'text-decoration: line-through 2px solid #ca4c53;' : '')}
`;

const RowMarket = styled.div`
    display: flex;
    position: relative;
    height: 39px;
    align-items: center;
    text-align: center;
    padding: 2px 7px;
`;

const InfoWrapper = styled(FlexDivRow)`
    font-size: 12px;
    line-height: 18px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: #ffffff;
    width: 100%;
    padding: 5px 5px 0 5px;
`;

const InfoDiv = styled(FlexDiv)``;

const InfoLabel = styled.span`
    font-weight: 600;
`;
const InfoValue = styled.span`
    font-weight: 700;
    margin-left: 5px;
`;

const ReferralWrapper = styled(FlexDivColumnCentered)``;

const ReferralLabel = styled.span`
    font-weight: 300;
    font-size: 10px;
    line-height: 12px;
    text-transform: uppercase;
    color: #ffffff;
    margin-top: 3px;
    white-space: nowrap;
`;

const HorizontalLine = styled.hr`
    width: 100%;
    border-top: 1.5px solid #64d9fe33;
    border-bottom: none;
    border-right: none;
    border-left: none;
    margin: 0;
`;
const HorizontalDashedLine = styled.hr`
    width: 100%;
    border-top: 1.5px dashed #64d9fe33;
    border-bottom: none;
    border-right: none;
    border-left: none;
    margin: 0;
`;

export default MyTicket;
