import { ReactComponent as OvertimeLogoIcon } from 'assets/images/overtime-logo.svg';
import { USD_SIGN } from 'constants/currency';
import { t } from 'i18next';
import React, { useMemo } from 'react';
import QRCode from 'react-qr-code';
import { useSelector } from 'react-redux';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import { formatShortDateWithTimeZone } from 'utils/formatters/date';
import { formatCurrencyWithSign, formatPercentage } from 'utils/formatters/number';
import { generateReferralLink } from 'utils/referral';
import { DisplayOptionsType } from '../DisplayOptions/DisplayOptions';

type MySimpleTicketProps = {
    markets: ParlaysMarket[];
    paid: number;
    payout: number;
    displayOptions: DisplayOptionsType;
};

const MySimpleTicket: React.FC<MySimpleTicketProps> = ({ markets, paid, payout, displayOptions }) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const percentage = (payout - paid) / paid;
    const payoutDisplayText = displayOptions.showUsdAmount ? formatCurrencyWithSign(USD_SIGN, payout) : '';
    const percentageDisplayText = displayOptions.showPercentage ? `+ ${formatPercentage(percentage)}` : '';

    const timestamp = useMemo(() => {
        return new Date();
    }, []);
    const timestampDisplayText = displayOptions.showTimestamp ? formatShortDateWithTimeZone(timestamp) : '';

    const isTicketLost = markets.some((market) => market.isResolved && !market.winning);
    const isTicketResolved = markets.every((market) => market.isResolved);

    return (
        <Container>
            <Header>
                {t('markets.parlay.share-ticket.header')}
                <BoldContent>{' overtimemarkets.xyz'}</BoldContent>
            </Header>
            <ContentRow>
                <OvertimeLogo />
                <ReferralWrapper>
                    <QRCode size={100} value={generateReferralLink(walletAddress)} />
                    <ReferralLabel>{t('markets.parlay.share-ticket.referral')}</ReferralLabel>
                </ReferralWrapper>
                <PayoutWrapper>
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
                    {isTicketResolved && (
                        <PayoutRow>
                            <PayoutValue isLost={isTicketLost} isText={true}>
                                {isTicketLost
                                    ? t('markets.parlay.share-ticket.loser')
                                    : t('markets.parlay.share-ticket.winner')}
                            </PayoutValue>
                        </PayoutRow>
                    )}
                </PayoutWrapper>
            </ContentRow>
            {timestampDisplayText && <Timestamp>{timestampDisplayText}</Timestamp>}
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)`
    align-items: center;
`;

const ContentRow = styled(FlexDivRowCentered)`
    margin: 0 10px 20px 10px;
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
    fill: ${(props) => props.theme.textColor.primary};
    height: 35px;
`;

const PayoutWrapper = styled.div`
    min-width: 180px;
    text-align: center;
    text-transform: uppercase;
    color: #5fc694;
`;

const PayoutRow = styled(FlexDivCentered)``;

const PayoutValue = styled.span<{ isLost?: boolean; isText?: boolean }>`
    font-size: 35px;
    line-height: 42px;
    font-weight: 800;
    ${(props) => (!props.isText && props.isLost ? 'text-decoration: line-through 2px solid #ca4c53;' : '')}
    ${(props) => (props.isText && props.isLost ? 'color: #ca4c53;' : '')}
    letter-spacing: ${(props) => (props.isText ? '0.13em' : 'normal')};
`;

const ReferralWrapper = styled(FlexDivColumnCentered)`
    margin: 0 20px;
    padding-top: 31px;
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

export default MySimpleTicket;
