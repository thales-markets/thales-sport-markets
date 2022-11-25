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
import { FlexDiv, FlexDivCentered, FlexDivColumn, FlexDivColumnCentered } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { formatMarketOdds } from 'utils/markets';
import { generateReferralLink } from 'utils/referral';
import MatchInfo from '../../../MatchInfo';
import { DisplayOptionsType } from '../DisplayOptions/DisplayOptions';

type MyTicketProps = {
    markets: ParlaysMarket[];
    totalQuote: number;
    paid: number;
    payout: number;
    displayOptions: DisplayOptionsType;
};

const MyTicket: React.FC<MyTicketProps> = ({ markets, totalQuote, paid, payout, displayOptions }) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const selectedOddsType = useSelector(getOddsType);

    const payoutDisplayText = displayOptions.showUsdAmount ? formatCurrencyWithSign(USD_SIGN, payout) : '';

    const isTicketLost = markets.some((market) => market.isResolved && !market.winning);

    return (
        <Container>
            <Header>
                {t('markets.parlay.share-ticket.header')}
                <BoldContent>{' overtimemarkets.xyz'}</BoldContent>
            </Header>
            <OvertimeLogo />
            {payoutDisplayText && (
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
            <InfoRow margin={'2px 0 0 0'}>
                <InfoLabel>{t('markets.parlay.share-ticket.total-quote')}:</InfoLabel>
                <InfoValue>{formatMarketOdds(selectedOddsType, totalQuote)}</InfoValue>
            </InfoRow>
            <InfoRow margin={'0 0 2px 0'}>
                <InfoLabel>{t('markets.parlay.share-ticket.paid')}:</InfoLabel>
                <InfoValue>{formatCurrencyWithSign(USD_SIGN, paid)}</InfoValue>
            </InfoRow>
            <HorizontalLine />
            <ReferralLabel>{t('markets.parlay.share-ticket.referral')}</ReferralLabel>
            <QRCode size={100} value={generateReferralLink(walletAddress)} />
        </Container>
    );
};

const matchInfoStyle = { fontSize: '12px', lineHeight: '14px', positionColor: '#ffffff' };

const Container = styled(FlexDivColumnCentered)`
    align-items: center;
`;

const MarketsContainer = styled(FlexDivColumn)`
    width: 100%;
`;

const Header = styled.span`
    font-weight: 200;
    font-size: 10px;
    line-height: 12px;
    text-align: center;
    text-transform: uppercase;
    color: #ffffff;
`;

const BoldContent = styled.span`
    font-weight: 900;
`;

const OvertimeLogo = styled(OvertimeLogoIcon)`
    margin: 8px 0;
    fill: ${(props) => props.theme.textColor.primary};
    height: 20px;
`;

const PayoutWrapper = styled.div`
    text-align: center;
    text-transform: uppercase;
    color: #5fc694;
    margin-bottom: 8px;
`;

const PayoutRow = styled(FlexDivCentered)``;

const PayoutLabel = styled.span`
    font-size: 30px;
    line-height: 30px;
    font-weight: 300;
`;

const PayoutValue = styled.span<{ isLost?: boolean }>`
    font-size: 35px;
    line-height: 35px;
    font-weight: 800;
    ${(props) => (props.isLost ? 'color: #ca4c53;' : '')}
`;

const Square = styled.div`
    margin: 0 10px;
    width: 10px;
    height: 10px;
    background: #5fc694;
    transform: rotate(-45deg);
`;

const RowMarket = styled.div`
    display: flex;
    position: relative;
    height: 43px;
    align-items: center;
    text-align: center;
    padding: 5px 7px;
`;

const InfoRow = styled(FlexDiv)<{ margin?: string }>`
    font-size: 12px;
    line-height: 18px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: #ffffff;
    width: 100%;
    padding: 0 15px;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
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
