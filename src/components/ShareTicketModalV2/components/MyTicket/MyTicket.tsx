import { ReactComponent as OvertimeLogoIcon } from 'assets/images/overtime-logo.svg';
import { t } from 'i18next';
import useGetReffererIdQuery from 'queries/referral/useGetReffererIdQuery';
import React from 'react';
import QRCode from 'react-qr-code';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
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
import { Coins, formatCurrencyWithKey } from 'thales-utils';
import { TicketMarket } from 'types/markets';
import { buildReffererLink } from 'utils/routes';
import { formatTicketOdds } from 'utils/tickets';
import MatchInfoV2 from '../../../MatchInfoV2';

type MyTicketProps = {
    markets: TicketMarket[];
    multiSingle: boolean;
    paid: number;
    payout: number;
    isTicketLost: boolean;
    isTicketResolved: boolean;
    collateral: Coins;
    isLive: boolean;
};

const MyTicket: React.FC<MyTicketProps> = ({
    markets,
    multiSingle,
    paid,
    payout,
    isTicketLost,
    isTicketResolved,
    collateral,
    isLive,
}) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const selectedOddsType = useSelector(getOddsType);

    const isTicket = !multiSingle;

    const matchInfoStyle = isMobile
        ? { fontSize: '10px', lineHeight: '12px' }
        : { fontSize: '11px', lineHeight: '14px' };

    const reffererIDQuery = useGetReffererIdQuery(walletAddress || '', { enabled: !!walletAddress });
    const reffererID = reffererIDQuery.isSuccess && reffererIDQuery.data ? reffererIDQuery.data : '';

    return (
        <Container>
            <ContentRow>
                <OvertimeLogo />
                {isTicket && <TicketLabel>{t('markets.parlay.share-ticket.parlay')}</TicketLabel>}
                {!isTicket && (
                    <Header isTicket={isTicket}>
                        {t('markets.parlay.share-ticket.header')}
                        <BoldContent>{' overtimemarkets.xyz'}</BoldContent>
                    </Header>
                )}
            </ContentRow>
            {isTicket && (
                <Header isTicket={isTicket}>
                    {t('markets.parlay.share-ticket.header')}
                    <BoldContent>{' overtimemarkets.xyz'}</BoldContent>
                </Header>
            )}
            <ContentRow margin={'3px 0'}>
                {reffererID && (
                    <ReferralWrapper>
                        <QRCode size={70} value={buildReffererLink(reffererID)} />
                        <ReferralLabel>{t('markets.parlay.share-ticket.referral')}</ReferralLabel>
                    </ReferralWrapper>
                )}
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
                            {formatCurrencyWithKey(collateral, payout)}
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
                                <MatchInfoV2
                                    market={market}
                                    readOnly={true}
                                    customStyle={matchInfoStyle}
                                    isLive={isLive}
                                />
                            </RowMarket>
                            {markets.length !== index + 1 && <HorizontalDashedLine />}
                        </React.Fragment>
                    );
                })}
            </MarketsContainer>
            <HorizontalLine />
            <InfoWrapper>
                {multiSingle ? (
                    <>
                        <InfoDiv>
                            <InfoLabel>{t('markets.parlay.share-ticket.positions')}:</InfoLabel>
                            <InfoValue>{markets.length}</InfoValue>
                        </InfoDiv>
                    </>
                ) : (
                    <>
                        <InfoDiv>
                            <InfoLabel>{t('markets.parlay.share-ticket.total-quote')}:</InfoLabel>
                            <InfoValue>{formatTicketOdds(selectedOddsType, paid, payout)}</InfoValue>
                        </InfoDiv>
                    </>
                )}
                <InfoDiv>
                    <InfoLabel>{t('markets.parlay.buy-in')}:</InfoLabel>
                    <InfoValue>{formatCurrencyWithKey(collateral, paid)}</InfoValue>
                </InfoDiv>
            </InfoWrapper>
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)`
    align-items: center;
`;

const ContentRow = styled(FlexDivRowCentered)<{ margin?: string }>`
    width: 356px;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
    @media (max-width: 950px) {
        width: 327px;
    }
`;

const MarketsContainer = styled(FlexDivColumn)`
    width: 100%;
`;

const Header = styled.span<{ isTicket: boolean }>`
    font-weight: 400;
    font-size: ${(props) => (props.isTicket ? '11' : '10')}px;
    line-height: ${(props) => (props.isTicket ? '13' : '12')}px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.175em;
    color: ${(props) => props.theme.textColor.primary};
    ${(props) => (props.isTicket ? 'white-space: nowrap;' : '')};
    ${(props) => (props.isTicket ? 'margin-top: 3px' : '')};
    @media (max-width: 950px) {
        letter-spacing: 0.117em;
    }
`;

const BoldContent = styled.span`
    font-weight: 600;
`;

const TicketLabel = styled.span`
    font-size: 34px;
    line-height: 27px;
    letter-spacing: 0.3em;
    font-weight: 400;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    padding-left: 8px;
    opacity: 0.8;
    @media (max-width: 950px) {
        letter-spacing: 0.18em;
    }
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
    font-weight: 400;
    padding: 0 5px;
    color: ${(props) => (props.isLost ? props.theme.status.loss : props.theme.status.win)};
    ${(props) => (props.isLost ? `text-decoration: line-through 2px solid ${props.theme.status.loss};` : '')};
`;

const Square = styled.div<{ isLost?: boolean; isResolved?: boolean }>`
    width: ${(props) => (props.isResolved ? '10' : '8')}px;
    height: ${(props) => (props.isResolved ? '10' : '8')}px;
    transform: rotate(-45deg);
    background: ${(props) => (props.isLost ? props.theme.status.loss : props.theme.status.win)};
`;

const PayoutValue = styled.span<{ isLost?: boolean; isResolved?: boolean }>`
    font-size: ${(props) => (props.isResolved ? '35' : '30')}px;
    line-height: ${(props) => (props.isResolved ? '37' : '32')}px;
    font-weight: 600;
    color: ${(props) => (props.isLost ? props.theme.status.loss : props.theme.status.win)};
    ${(props) => (props.isLost ? `text-decoration: line-through 2px solid ${props.theme.status.loss};` : '')}
`;

const RowMarket = styled.div`
    display: flex;
    position: relative;
    align-items: center;
    text-align: center;
    padding: 4px 7px;
`;

const InfoWrapper = styled(FlexDivRow)`
    font-size: 12px;
    line-height: 18px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    width: 100%;
    padding: 5px 5px 0 5px;
`;

const InfoDiv = styled(FlexDiv)``;

const InfoLabel = styled.span`
    font-weight: 600;
`;
const InfoValue = styled.span`
    font-weight: 600;
    margin-left: 5px;
`;

const ReferralWrapper = styled(FlexDivColumnCentered)``;

const ReferralLabel = styled.span`
    font-weight: 400;
    font-size: 10px;
    line-height: 12px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    margin-top: 3px;
    white-space: nowrap;
`;

const HorizontalLine = styled.hr`
    width: 100%;
    border-top: 1.5px solid ${(props) => props.theme.background.senary};
    border-bottom: none;
    border-right: none;
    border-left: none;
    margin: 0;
`;
const HorizontalDashedLine = styled.hr`
    width: 100%;
    border-top: 1.5px dashed ${(props) => props.theme.background.senary};
    border-bottom: none;
    border-right: none;
    border-left: none;
    margin: 0;
`;

export default MyTicket;
