import { ReactComponent as OvertimeLogoIcon } from 'assets/images/overtime-logo.svg';
import { USD_SIGN } from 'constants/currency';
import { t } from 'i18next';
import React, { useMemo } from 'react';
import QRCode from 'react-qr-code';
import { useSelector } from 'react-redux';
import { getOddsType } from 'redux/modules/ui';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import { formatShortDateWithTimeZone } from 'utils/formatters/date';
import { formatCurrencyWithSign, formatPercentage } from 'utils/formatters/number';
import { formatMarketOdds } from 'utils/markets';
import { generateReferralLink } from 'utils/referral';
import MatchInfo from '../../../MatchInfo';
import { DisplayOptionsType } from '../DisplayOptions/DisplayOptions';

type MyTicketProps = {
    markets: ParlaysMarket[];
    totalQuote: number;
    paid: number;
    payout: number;
    profitPercentage?: number;
    displayOptions: DisplayOptionsType;
};

const MyTicket: React.FC<MyTicketProps> = ({ markets, totalQuote, paid, payout, profitPercentage, displayOptions }) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const selectedOddsType = useSelector(getOddsType);

    const percentage = profitPercentage ? profitPercentage : (payout - paid) / paid;
    const payoutDisplayText = displayOptions.showUsdAmount ? formatCurrencyWithSign(USD_SIGN, payout) : '';
    const percentageDisplayText = displayOptions.showPercentage ? `+ ${formatPercentage(percentage, 0)}` : '';

    const timestamp = useMemo(() => {
        return new Date();
    }, []);
    const timestampDisplayText = displayOptions.showTimestamp ? formatShortDateWithTimeZone(timestamp) : '';

    const isTicketLost = markets.some((market) => market.isResolved && !market.winning);

    return (
        <Container>
            <Header>
                {t('markets.parlay.share-ticket.header')}
                <BoldContent>{' overtimemarkets.xyz'}</BoldContent>
            </Header>
            <OvertimeLogo />
            {(payoutDisplayText || percentageDisplayText) && (
                <PayoutWrapper>
                    <PayoutRow>
                        <Square />
                        <PayoutLabel>{t('markets.parlay.share-ticket.payout')}</PayoutLabel>
                        <Square />
                    </PayoutRow>
                    {payoutDisplayText && (
                        <PayoutRow>
                            <PayoutValue isLost={isTicketLost}>{payoutDisplayText}</PayoutValue>
                        </PayoutRow>
                    )}
                    {percentageDisplayText && (
                        <PayoutRow>
                            <PayoutValue isLost={isTicketLost}>{percentageDisplayText}</PayoutValue>
                        </PayoutRow>
                    )}
                </PayoutWrapper>
            )}
            <HorizontalLine />
            <MarketsContainer>
                {markets.map((market, index) => {
                    return (
                        <React.Fragment key={index}>
                            <RowMarket>
                                <MatchInfo market={market} readOnly={true} customStyle={matchInfoStyle} />
                            </RowMarket>
                            {markets.length !== index + 1 && <HorizontalDashedLine />}
                        </React.Fragment>
                    );
                })}
            </MarketsContainer>
            <HorizontalLine />
            <InfoRow>
                <InfoLabel>{t('markets.parlay.share-ticket.total-quote')}:</InfoLabel>
                <InfoValue>{formatMarketOdds(selectedOddsType, totalQuote)}</InfoValue>
            </InfoRow>
            <InfoRow>
                <InfoLabel>{t('markets.parlay.share-ticket.stake')}:</InfoLabel>
                <InfoValue>{formatCurrencyWithSign(USD_SIGN, paid)}</InfoValue>
            </InfoRow>
            <HorizontalLine />
            <ReferralLabel>{t('markets.parlay.share-ticket.referral')}</ReferralLabel>
            <QRCode size={100} value={generateReferralLink(walletAddress)} />
            {timestampDisplayText && <Timestamp>{timestampDisplayText}</Timestamp>}
        </Container>
    );
};

const matchInfoStyle = { fontSize: '12px', lineHeight: '14px', positionColor: '#ffffff' };

const Container = styled(FlexDivColumnCentered)`
    align-items: center;
    max-width: 370px;
`;

const MarketsContainer = styled(FlexDivColumn)`
    width: 100%;
`;

const Header = styled.span`
    font-weight: 200;
    font-size: 11px;
    line-height: 13px;
    text-align: center;
    text-transform: uppercase;
    color: #ffffff;
    margin-top: 5px;
`;

const BoldContent = styled.span`
    font-weight: 900;
`;

const OvertimeLogo = styled(OvertimeLogoIcon)`
    margin: 15px 0;
    fill: ${(props) => props.theme.textColor.primary};
    height: 35px;
`;

const PayoutWrapper = styled.div`
    text-align: center;
    text-transform: uppercase;
    color: #5fc694;
    margin-bottom: 15px;
`;

const PayoutRow = styled(FlexDivCentered)``;

const PayoutLabel = styled.span`
    font-size: 40px;
    line-height: 40px;
    font-weight: 300;
`;

const PayoutValue = styled.span<{ isLost?: boolean }>`
    font-size: 45px;
    line-height: 45px;
    font-weight: 800;
    ${(props) => (props.isLost ? 'text-decoration: line-through 2px solid #ca4c53;' : '')}
`;

const Square = styled.div`
    margin: 0 10px;
    width: 14px;
    height: 14px;
    background: #5fc694;
    transform: rotate(-45deg);
`;

const RowMarket = styled.div`
    display: flex;
    position: relative;
    margin: 5px 0;
    height: 45px;
    align-items: center;
    text-align: center;
    padding: 5px 7px;
`;

const InfoRow = styled(FlexDiv)`
    font-size: 12px;
    line-height: 24px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: #ffffff;
    width: 100%;
    padding: 0 15px;
`;
const InfoLabel = styled.span`
    font-weight: 600;
`;
const InfoValue = styled.span`
    font-weight: 700;
    margin-left: auto;
`;

const ReferralLabel = styled.span`
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    text-transform: uppercase;
    color: #ffffff;
    margin-top: 10px;
    margin-bottom: 5px;
`;

const Timestamp = styled.span`
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    color: #ffffff;
    margin-top: 10px;
`;

const HorizontalLine = styled.hr`
    width: 100%;
    border-top: 1.5px solid #64d9fe33;
    border-bottom: none;
    border-right: none;
    border-left: none;
`;
const HorizontalDashedLine = styled.hr`
    width: 100%;
    border-top: 1.5px dashed #64d9fe33;
    border-bottom: none;
    border-right: none;
    border-left: none;
`;

export default MyTicket;
