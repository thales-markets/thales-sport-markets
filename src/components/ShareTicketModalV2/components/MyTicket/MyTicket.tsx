import OvertimeLogoIcon from 'assets/images/overtime-logo.svg?react';
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
    applyPayoutMultiplier,
    isTicketOpen,
    systemBetData,
}) => {
    const selectedOddsType = useSelector(getOddsType);

    const isTicket = !multiSingle;
    const isEth = collateral === CRYPTO_CURRENCY_MAP.ETH || collateral === CRYPTO_CURRENCY_MAP.WETH;

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
            <ContentRow margin={'10px 0'}>
                <PayoutWrapper>
                    <PayoutRow>
                        <Square isLost={isTicketLost} />
                        <PayoutLabel isLost={isTicketLost}>
                            {systemBetData && isTicketOpen
                                ? t('markets.parlay.max-payout')
                                : t('markets.parlay.payout')}
                        </PayoutLabel>
                        <Square isLost={isTicketLost} />
                    </PayoutRow>
                    <PayoutRow>
                        <PayoutValue isLost={isTicketLost}>{formatCurrencyWithKey(collateral, payout)}</PayoutValue>
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
                                    isLive={isLive}
                                    applyPayoutMultiplier={applyPayoutMultiplier}
                                />
                            </RowMarket>
                            {markets.length !== index + 1 && <HorizontalDashedLine />}
                        </React.Fragment>
                    );
                })}
            </MarketsContainer>
            <HorizontalLine />
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
    letter-spacing: 0.11em;
    color: ${(props) => props.theme.textColor.primary};
    ${(props) => (props.isTicket ? 'white-space: nowrap;' : '')};
    ${(props) => (props.isTicket ? 'margin-top: 3px' : '')};
    @media (max-width: 950px) {
        letter-spacing: 0.05em;
    }
`;

const BoldContent = styled.span`
    font-weight: 600;
`;

const TicketLabel = styled.span`
    font-size: 32px;
    line-height: 26px;
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
    height: 26px;
`;

const PayoutWrapper = styled.div`
    width: 100%;
    text-align: center;
    text-transform: uppercase;
`;

const PayoutRow = styled(FlexDivCentered)``;

const PayoutLabel = styled.span<{ isLost?: boolean }>`
    font-size: 24px;
    line-height: 24px;
    font-weight: 400;
    padding: 0 5px;
    color: ${(props) => (props.isLost ? props.theme.status.loss : props.theme.status.win)};
    ${(props) => (props.isLost ? `text-decoration: line-through 2px solid ${props.theme.status.loss};` : '')};
`;

const Square = styled.div<{ isLost?: boolean }>`
    width: 10px;
    height: 10px;
    transform: rotate(-45deg);
    background: ${(props) => (props.isLost ? props.theme.status.loss : props.theme.status.win)};
`;

const PayoutValue = styled.span<{ isLost?: boolean }>`
    font-size: 30px;
    line-height: 32px;
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

export default MyTicket;
