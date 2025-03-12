import Logo from 'components/Logo';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { t } from 'i18next';
import React from 'react';
import { useSelector } from 'react-redux';
import { getOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import {
    FlexDiv,
    FlexDivCentered,
    FlexDivColumn,
    FlexDivColumnCentered,
    FlexDivRow,
    FlexDivRowCentered,
    FlexDivSpaceBetween,
} from 'styles/common';
import { Coins, formatCurrency, formatCurrencyWithKey } from 'thales-utils';
import { SystemBetData, TicketMarket } from 'types/markets';
import { formatTicketOdds } from 'utils/tickets';
import MatchInfoV2 from '../../../MatchInfoV2';

type MyTicketProps = {
    markets: TicketMarket[];
    multiSingle: boolean;
    paid: number;
    payout: number;
    isTicketLost: boolean;
    collateral: Coins;
    isLive: boolean;
    isSgp: boolean;
    applyPayoutMultiplier: boolean;
    isTicketOpen: boolean;
    systemBetData?: SystemBetData;
};

const MyTicket: React.FC<MyTicketProps> = ({
    markets,
    multiSingle,
    paid,
    payout,
    isTicketLost,
    collateral,
    isLive,
    isSgp,
    applyPayoutMultiplier,
    isTicketOpen,
    systemBetData,
}) => {
    const selectedOddsType = useSelector(getOddsType);

    const isEth = collateral === CRYPTO_CURRENCY_MAP.ETH || collateral === CRYPTO_CURRENCY_MAP.WETH;

    const isTwoColumn = markets.length > 8;
    const ticketTypeLabel = isSgp ? 'SGP' : systemBetData ? 'System' : 'Regular';

    return (
        <Container>
            <ContentRow>
                <Logo />
                <VerticalLine />
                <FlexDivColumn gap={2}>
                    <Subtitle>
                        <span>{t('markets.parlay.share-ticket.the-best')}</span>{' '}
                        <BoldContent>{t('markets.parlay.share-ticket.decentralized')}</BoldContent>
                    </Subtitle>
                    <Subtitle>
                        <BoldContent>{t('markets.parlay.share-ticket.crypto-sportsbook')}</BoldContent>
                    </Subtitle>
                </FlexDivColumn>
            </ContentRow>
            <HeaderContainer>
                <HeaderTriangleLeft />
                <Header>{t('markets.parlay.share-ticket.header', { betType: ticketTypeLabel })}</Header>
                <HeaderTriangleRight />
            </HeaderContainer>
            <ContentRow margin={'5px 0 10px 0'} flex={isTwoColumn ? '1' : ''}>
                <PayoutWrapper isTwoColumn={isTwoColumn}>
                    <PayoutRow>
                        <PayoutLabel isLost={isTicketLost}>
                            {systemBetData && isTicketOpen
                                ? t('markets.parlay.max-payout')
                                : t('markets.parlay.payout')}
                        </PayoutLabel>
                    </PayoutRow>
                    <PayoutRow>
                        <PayoutValue isLost={isTicketLost}>{formatCurrencyWithKey(collateral, payout)}</PayoutValue>
                    </PayoutRow>
                </PayoutWrapper>
            </ContentRow>
            {!isTwoColumn ? (
                <MarketsContainer>
                    {markets.map((market, index) => {
                        return (
                            <React.Fragment key={index}>
                                <RowMarket>
                                    <MatchInfoV2
                                        market={market}
                                        readOnly
                                        isLive={isLive}
                                        isSgp={isSgp}
                                        applyPayoutMultiplier={applyPayoutMultiplier}
                                    />
                                </RowMarket>
                            </React.Fragment>
                        );
                    })}
                </MarketsContainer>
            ) : (
                <TwoColumnRowContainer>
                    <MarketsContainer isTwoColumn>
                        {markets.slice(0, 8).map((market, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <RowMarket>
                                        <MatchInfoV2
                                            market={market}
                                            readOnly
                                            isLive={isLive}
                                            isSgp={isSgp}
                                            applyPayoutMultiplier={applyPayoutMultiplier}
                                        />
                                    </RowMarket>
                                </React.Fragment>
                            );
                        })}
                    </MarketsContainer>
                    <MarketsContainer isTwoColumn>
                        {markets.slice(8, markets.length).map((market, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <RowMarket>
                                        <MatchInfoV2
                                            market={market}
                                            readOnly
                                            isLive={isLive}
                                            isSgp={isSgp}
                                            applyPayoutMultiplier={applyPayoutMultiplier}
                                        />
                                    </RowMarket>
                                </React.Fragment>
                            );
                        })}
                    </MarketsContainer>
                </TwoColumnRowContainer>
            )}
            <BottomInfoContent>
                {systemBetData && (
                    <InfoWrapper>
                        <InfoDiv isWinning={!isTicketOpen && !isTicketLost} isLost={!isTicketOpen && isTicketLost}>
                            <InfoLabel>{t('markets.parlay.system')}:</InfoLabel>
                            <InfoValue>
                                {systemBetData?.systemBetDenominator}/{markets.length}
                                {!isTicketOpen &&
                                    (isTicketLost ? (
                                        <Wrong className="icon icon--wrong" />
                                    ) : (
                                        <Correct className="icon icon--correct" />
                                    ))}
                            </InfoValue>
                        </InfoDiv>
                        <InfoDiv>
                            <InfoLabel>{t('markets.parlay.number-of-combinations-short')}:</InfoLabel>
                            <InfoValue>{systemBetData?.numberOfCombination}</InfoValue>
                        </InfoDiv>
                    </InfoWrapper>
                )}
                {systemBetData && !isTicketOpen && !isTicketLost && (
                    <InfoWrapper>
                        <InfoDivFull>
                            <InfoLabel>{t('markets.parlay.number-of-winning-combinations-short')}:</InfoLabel>
                            <InfoValue>{systemBetData?.numberOfWinningCombinations}</InfoValue>
                        </InfoDivFull>
                    </InfoWrapper>
                )}
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
                                <InfoLabel>
                                    {systemBetData
                                        ? !isTicketOpen && !isTicketLost
                                            ? t('markets.parlay.winning-quote')
                                            : t('markets.parlay.max-quote')
                                        : t('markets.parlay.share-ticket.total-quote')}
                                    :
                                </InfoLabel>
                                <InfoValue>
                                    {systemBetData
                                        ? formatTicketOdds(
                                              selectedOddsType,
                                              systemBetData?.buyInPerCombination || 0,
                                              !isTicketOpen && !isTicketLost ? payout : systemBetData?.maxPayout || 0
                                          )
                                        : formatTicketOdds(selectedOddsType, paid, payout)}
                                </InfoValue>
                            </InfoDiv>
                        </>
                    )}
                    <InfoDiv>
                        <InfoLabel>{t('markets.parlay.buy-in')}:</InfoLabel>
                        <BuyInValue>{formatCurrencyWithKey(collateral, paid)}</BuyInValue>
                    </InfoDiv>
                </InfoWrapper>
                {systemBetData && (isTicketOpen || isTicketLost) && (
                    <InfoWrapper>
                        <InfoDivFull>
                            <InfoLabel>{t('markets.parlay.min-max-payout')}:</InfoLabel>
                            <InfoValue>
                                {formatCurrency(systemBetData?.minPayout || 0, isEth ? 4 : 2)}/
                                {formatCurrency(systemBetData?.maxPayout || 0, isEth ? 4 : 2)} {collateral}
                            </InfoValue>
                        </InfoDivFull>
                    </InfoWrapper>
                )}
            </BottomInfoContent>
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)`
    align-items: center;
`;

const ContentRow = styled(FlexDivRowCentered)<{ margin?: string; flex?: string }>`
    position: relative;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
    ${(props) => (props.flex ? `flex: ${props.flex};` : '')}
`;

const TwoColumnRowContainer = styled(FlexDiv)`
    flex: 1;
    width: 100%;
    gap: 3px;
`;

const MarketsContainer = styled(FlexDivColumn)<{ isTwoColumn?: boolean }>`
    width: ${(props) => (props.isTwoColumn ? '50%' : '100%')};
`;

const HeaderContainer = styled(FlexDiv)`
    width: 100%;
    margin: 10px 0;
`;

const Header = styled.span`
    width: 100%;
    height: 20px;
    background: ${(props) => props.theme.background.quaternary};
    font-weight: 900;
    font-size: 11px;
    line-height: 20px;
    letter-spacing: 3px;
    text-align: center;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.senary};
    white-space: nowrap;
`;

const HeaderTriangleLeft = styled.div`
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-right: 10px solid ${(props) => props.theme.background.quaternary};
`;

const HeaderTriangleRight = styled.div`
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 10px solid ${(props) => props.theme.background.quaternary};
`;

const BoldContent = styled.div`
    font-weight: 700;
`;

const PayoutWrapper = styled.div<{ isTwoColumn?: boolean }>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    text-align: center;
    text-transform: uppercase;
    flex: 1;
`;

const PayoutRow = styled(FlexDivCentered)``;

const PayoutLabel = styled.span<{ isLost?: boolean }>`
    font-size: 30px;
    line-height: 30px;
    font-weight: 400;
    padding: 0 5px;
    color: ${(props) => (props.isLost ? props.theme.status.loss : props.theme.status.win)};
    ${(props) => (props.isLost ? `text-decoration: line-through 2px solid ${props.theme.status.loss};` : '')};
`;

const PayoutValue = styled.span<{ isLost?: boolean }>`
    font-size: 50px;
    line-height: 52px;
    font-weight: 600;
    text-transform: none;
    color: ${(props) => (props.isLost ? props.theme.status.loss : props.theme.status.win)};
    ${(props) => (props.isLost ? `text-decoration: line-through 2px solid ${props.theme.status.loss};` : '')}
`;

const RowMarket = styled.div`
    display: flex;
    position: relative;
    align-items: center;
    text-align: center;
    padding: 4px 7px;
    background: rgba(1, 1, 15, 0.4);
    div[readonly] {
        line-height: 10px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        display: block;
    }
    span:nth-child(2) {
        color: ${(props) => props.theme.textColor.primary};
    }
    :not(:first-child) {
        :before {
            content: '';
            position: absolute;
            left: 0;
            height: 6px;
            width: 100%;
            top: -5px;
            background: radial-gradient(
                    circle,
                    transparent,
                    transparent 50%,
                    rgba(1, 1, 15, 0.4) 50%,
                    rgba(1, 1, 15, 0.4) 100%
                )
                0px -6px / 0.7rem 0.7rem repeat-x;
        }
    }
    :not(:last-child) {
        margin-bottom: 12px;
        :after {
            content: '';
            position: absolute;
            left: 0;
            height: 6px;
            width: 100%;
            bottom: -5px;
            background: radial-gradient(
                    circle,
                    transparent,
                    transparent 50%,
                    rgba(1, 1, 15, 0.4) 50%,
                    rgba(1, 1, 15, 0.4) 100%
                )
                0px 1px / 0.7rem 0.7rem repeat-x;
        }
    }
`;

const InfoWrapper = styled(FlexDivRow)`
    font-size: 12px;
    line-height: 18px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    width: 100%;
    padding: 2px 5px 0 5px;
`;

const InfoDiv = styled(FlexDiv)<{ isWinning?: boolean; isLost?: boolean }>`
    color: ${(props) =>
        props.isWinning
            ? props.theme.status.win
            : props.isLost
            ? props.theme.status.loss
            : props.theme.textColor.primary};
`;

const InfoDivFull = styled(FlexDivSpaceBetween)`
    width: 100%;
`;

const InfoLabel = styled.span`
    font-weight: 600;
`;

const InfoValue = styled.span`
    font-weight: 600;
    margin-left: 5px;
`;

const BuyInValue = styled(InfoValue)`
    text-transform: none;
`;

const Icon = styled.i`
    font-size: 12px;
    margin-left: 4px;
    margin-top: -3px;
`;

const Correct = styled(Icon)`
    color: ${(props) => props.theme.status.win};
`;

const Wrong = styled(Icon)`
    color: ${(props) => props.theme.status.loss};
`;

const VerticalLine = styled.div`
    margin: 0 10px;
    border-left: 2px solid white;
    height: 100%;
`;

const Subtitle = styled.div`
    display: flex;
    gap: 3px;
    color: white;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 200;
`;

const BottomInfoContent = styled.div`
    margin-top: 3px;
    border-radius: 5px;
    padding: 5px;
    width: 100%;
    background: rgba(1, 1, 15, 0.4);
`;

export default MyTicket;
