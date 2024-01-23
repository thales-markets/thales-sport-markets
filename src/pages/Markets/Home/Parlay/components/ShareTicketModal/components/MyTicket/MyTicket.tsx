import { ReactComponent as OvertimeLogoIcon } from 'assets/images/overtime-logo.svg';
import { USD_SIGN } from 'constants/currency';
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
import { formatCurrencyWithSign } from 'thales-utils';
import { ParlaysMarket } from 'types/markets';
import { extractCombinedMarketsFromParlayMarkets, removeCombinedMarketFromParlayMarkets } from 'utils/combinedMarkets';
import { formatParlayOdds } from 'utils/parlay';
import { buildReffererLink } from 'utils/routes';
import MatchInfo from '../../../MatchInfo';
import MatchInfoOfCombinedMarket from '../../../MatchInfoOfCombinedMarket/MatchInfoOfCombinedMarket';

type MyTicketProps = {
    markets: ParlaysMarket[];
    multiSingle: boolean;
    totalQuote: number;
    paid: number;
    payout: number;
};

const MyTicket: React.FC<MyTicketProps> = ({ markets, multiSingle, paid, payout }) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const selectedOddsType = useSelector(getOddsType);

    const isTicketLost = markets.some((market) => market.isResolved && market.winning !== undefined && !market.winning);
    const isTicketResolved = markets.every((market) => market.isResolved || market.isCanceled) || isTicketLost;
    const isParlay = markets.length > 1 && !multiSingle;

    const combinedMarkets = extractCombinedMarketsFromParlayMarkets(markets);
    const parlayGamesWithoutCombinedMarkets = removeCombinedMarketFromParlayMarkets(markets);

    const matchInfoStyle = isMobile
        ? { fontSize: '10px', lineHeight: '12px' }
        : { fontSize: '11px', lineHeight: '13px' };

    const reffererIDQuery = useGetReffererIdQuery(walletAddress || '', { enabled: !!walletAddress });
    const reffererID = reffererIDQuery.isSuccess && reffererIDQuery.data ? reffererIDQuery.data : '';

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
                            {formatCurrencyWithSign(USD_SIGN, payout)}
                        </PayoutValue>
                    </PayoutRow>
                </PayoutWrapper>
            </ContentRow>
            <HorizontalLine />
            <MarketsContainer>
                {combinedMarkets.length > 0 &&
                    combinedMarkets.map((combinedMarket, index) => {
                        return (
                            <React.Fragment key={index}>
                                <RowMarket>
                                    <MatchInfoOfCombinedMarket
                                        combinedMarket={combinedMarket}
                                        readOnly={true}
                                        isHighlighted={true}
                                        customStyle={matchInfoStyle}
                                    />
                                </RowMarket>
                                {markets.length !== index + 1 && <HorizontalDashedLine />}
                            </React.Fragment>
                        );
                    })}
                {parlayGamesWithoutCombinedMarkets.length > 0 &&
                    parlayGamesWithoutCombinedMarkets.map((market, index) => {
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
                            <InfoValue>{formatParlayOdds(selectedOddsType, paid, payout)}</InfoValue>
                        </InfoDiv>
                    </>
                )}
                <InfoDiv>
                    <InfoLabel>{t('markets.parlay.buy-in')}:</InfoLabel>
                    <InfoValue>{formatCurrencyWithSign(USD_SIGN, paid, 2)}</InfoValue>
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

const Header = styled.span<{ isParlay: boolean }>`
    font-weight: 200;
    font-size: ${(props) => (props.isParlay ? '11' : '10')}px;
    line-height: ${(props) => (props.isParlay ? '13' : '12')}px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.175em;
    color: ${(props) => props.theme.textColor.primary};
    ${(props) => (props.isParlay ? 'white-space: nowrap;' : '')};
    ${(props) => (props.isParlay ? 'margin-top: 3px' : '')};
    @media (max-width: 950px) {
        letter-spacing: 0.117em;
    }
`;

const BoldContent = styled.span`
    font-weight: 900;
`;

const ParlayLabel = styled.span`
    font-size: 34px;
    line-height: 27px;
    letter-spacing: 0.3em;
    font-weight: 300;
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
    font-weight: 200;
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
    font-weight: 800;
    color: ${(props) => (props.isLost ? props.theme.status.loss : props.theme.status.win)};
    ${(props) => (props.isLost ? `text-decoration: line-through 2px solid ${props.theme.status.loss};` : '')}
`;

const RowMarket = styled.div`
    display: flex;
    position: relative;
    height: 39px;
    align-items: center;
    text-align: center;
    padding: 2px 7px;
    @media (max-width: 950px) {
        height: 35px;
    }
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
    font-weight: 700;
    margin-left: 5px;
`;

const ReferralWrapper = styled(FlexDivColumnCentered)``;

const ReferralLabel = styled.span`
    font-weight: 300;
    font-size: 10px;
    line-height: 12px;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    margin-top: 3px;
    white-space: nowrap;
`;

const HorizontalLine = styled.hr`
    width: 100%;
    border-top: 1.5px solid ${(props) => props.theme.background.secondary};
    border-bottom: none;
    border-right: none;
    border-left: none;
    margin: 0;
`;
const HorizontalDashedLine = styled.hr`
    width: 100%;
    border-top: 1.5px dashed ${(props) => props.theme.background.secondary};
    border-bottom: none;
    border-right: none;
    border-left: none;
    margin: 0;
`;

export default MyTicket;
