import { ReactComponent as OvertimeLogoIcon } from 'assets/images/overtime-logo.svg';
import { USD_SIGN } from 'constants/currency';
import { t } from 'i18next';
import React from 'react';
import QRCode from 'react-qr-code';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { generateReferralLink } from 'utils/referral';
import MatchLogos from '../../../MatchLogos';

type MySimpleTicketProps = {
    markets: ParlaysMarket[];
    payout: number;
};

const MySimpleTicket: React.FC<MySimpleTicketProps> = ({ markets, payout }) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const isTicketLost = markets.some((market) => market.isResolved && !market.winning);
    const isTicketResolved = markets.every((market) => market.isResolved || market.isCanceled) || isTicketLost;

    return (
        <Container>
            <Header>
                {t('markets.parlay.share-ticket.header')}
                <BoldContent>{' overtimemarkets.xyz'}</BoldContent>
            </Header>
            <ContentRow>
                <ContentColumn>
                    <ContentRow margin={isMobile ? '0 0 5px 0' : '0 0 10px 0'}>
                        <OvertimeLogo />
                        {markets.length > 1 && <ParlayLabel>{t('markets.parlay.share-ticket.parlay')}</ParlayLabel>}
                    </ContentRow>
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
                        <PayoutValue isLost={isTicketLost}>{formatCurrencyWithSign(USD_SIGN, payout)}</PayoutValue>
                    </PayoutRow>
                </ContentColumn>
                <ReferralWrapper>
                    <QRCode size={isMobile ? 70 : 80} value={generateReferralLink(walletAddress)} />
                    <ReferralLabel>{t('markets.parlay.share-ticket.referral')}</ReferralLabel>
                </ReferralWrapper>
            </ContentRow>
            <ContentRow height={'35px'} margin={isMobile ? '5px 0 0 0' : '10px 0 0 0'} justify={'space-around'}>
                {markets.map((market, index) => (
                    <MatchLogos key={index} market={market} width={'50px'} isHighlighted={true} />
                ))}
            </ContentRow>
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)`
    align-items: center;
`;

const ContentRow = styled.div<{ height?: string; margin?: string; justify?: string }>`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: ${(props) => (props.justify ? props.justify : 'center')};
    ${(props) => (props.height ? `height: ${props.height};` : '')}
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

const ContentColumn = styled.div`
    width: 100%;
    text-align: center;
    text-transform: uppercase;
    margin-right: 10px;
`;

const Header = styled.span`
    font-weight: 200;
    font-size: 13px;
    line-height: 15px;
    text-align: center;
    text-transform: uppercase;
    color: #ffffff;
    margin-bottom: 10px;
    letter-spacing: 0.08em;
    white-space: nowrap;
    @media (max-width: 950px) {
        font-size: 12px;
        line-height: 14px;
        letter-spacing: 0.06em;
        margin-bottom: 4px;
    }
`;

const BoldContent = styled.span`
    font-weight: 900;
`;

const ParlayLabel = styled.span`
    font-size: 27px;
    line-height: 29px;
    font-weight: 200;
    text-transform: uppercase;
    color: #ffffff;
    padding-left: 5px;
    opacity: 0.8;
`;

const OvertimeLogo = styled(OvertimeLogoIcon)`
    width: 120px;
    fill: ${(props) => props.theme.textColor.primary};
`;

const PayoutRow = styled(FlexDivCentered)``;

const PayoutLabel = styled.span<{ isLost?: boolean; isResolved?: boolean }>`
    font-size: ${(props) => (props.isResolved ? '32' : '25')}px;
    line-height: ${(props) => (props.isResolved ? '32' : '25')}px;
    font-weight: 300;
    padding: 0 5px;
    color: ${(props) => (props.isLost ? '#ca4c53' : '#5fc694')};
    ${(props) => (props.isLost ? 'text-decoration: line-through 2px solid #ca4c53;' : '')};
    @media (max-width: 950px) {
        font-size: ${(props) => (props.isResolved ? '32' : '20')}px;
        line-height: ${(props) => (props.isResolved ? '32' : '20')}px;
    }
`;

const Square = styled.div<{ isLost?: boolean; isResolved?: boolean }>`
    width: ${(props) => (props.isResolved ? '10' : '9')}px;
    height: ${(props) => (props.isResolved ? '10' : '9')}px;
    transform: rotate(-45deg);
    background: ${(props) => (props.isLost ? '#ca4c53' : '#5fc694')};
`;

const PayoutValue = styled.span<{ isLost?: boolean }>`
    font-size: 35px;
    line-height: 37px;
    font-weight: 800;
    color: ${(props) => (props.isLost ? '#ca4c53' : '#5fc694')};
    ${(props) => (props.isLost ? 'text-decoration: line-through 2px solid #ca4c53;' : '')}
`;

const ReferralWrapper = styled(FlexDivColumnCentered)``;

const ReferralLabel = styled.span`
    font-weight: 600;
    font-size: 11px;
    line-height: 13px;
    text-transform: uppercase;
    color: #ffffff;
    margin-top: 5px;
    white-space: nowrap;
    text-align: center;
    @media (max-width: 950px) {
        font-size: 10px;
        line-height: 12px;
        margin-top: 3px;
    }
`;

export default MySimpleTicket;
