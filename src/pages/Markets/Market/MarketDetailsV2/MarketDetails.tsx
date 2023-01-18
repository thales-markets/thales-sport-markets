import React, { useEffect, useState, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MatchInfo from './components/MatchInfo';
import BackToLink from 'pages/Markets/components/BackToLink';
import { ChildMarkets, MarketData, SportMarketLiveResult } from 'types/markets';
import Positions from './components/Positions';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import styled from 'styled-components';
import { buildHref } from 'utils/routes';
import ROUTES from 'constants/routes';
import { OP_INCENTIVIZED_LEAGUE } from 'constants/markets';
import Tooltip from 'components/Tooltip';
import { ReactComponent as OPLogo } from 'assets/images/optimism-logo.svg';
import Parlay from 'pages/Markets/Home/Parlay';
import Transactions from '../Transactions';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import useChildMarketsQuery from 'queries/markets/useChildMarketsQuery';
import { GAME_STATUS, MAIN_COLORS } from 'constants/ui';
import { BetType } from 'constants/tags';
import FooterSidebarMobile from 'components/FooterSidebarMobile';
import ParlayMobileModal from 'pages/Markets/Home/Parlay/components/ParlayMobileModal';
import useSportMarketLiveResultQuery from 'queries/markets/useSportMarketLiveResultQuery';
import Web3 from 'web3';

type MarketDetailsPropType = {
    market: MarketData;
};

const MarketDetails: React.FC<MarketDetailsPropType> = ({ market }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const [showParlayMobileModal, setShowParlayMobileModal] = useState<boolean>(false);

    const [lastValidChildMarkets, setLastValidChildMarkets] = useState<ChildMarkets>({
        spreadMarkets: [],
        totalMarkets: [],
        doubleChanceMarkets: [],
    });

    const childMarketsQuery = useChildMarketsQuery(market, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (childMarketsQuery.isSuccess && childMarketsQuery.data) {
            setLastValidChildMarkets(childMarketsQuery.data);
        }
    }, [childMarketsQuery.isSuccess, childMarketsQuery.data]);

    const childMarkets: ChildMarkets = useMemo(() => {
        if (childMarketsQuery.isSuccess && childMarketsQuery.data) {
            return childMarketsQuery.data;
        }
        return lastValidChildMarkets;
    }, [childMarketsQuery.isSuccess, childMarketsQuery.data, lastValidChildMarkets]);

    const showAMM = !market.resolved && !market.cancelled && !market.gameStarted && !market.paused;

    const isGameCancelled = market.cancelled || (!market.gameStarted && market.resolved);
    const isGameResolved = market.resolved || market.cancelled;
    const isPendingResolution = market.gameStarted && !isGameResolved;
    const isGamePaused = market.paused && !isGameResolved;
    const showStatus = market.resolved || market.cancelled || market.gameStarted || market.paused;
    const gameIdString = Web3.utils.toAscii(market.gameDetails.gameId);
    const [liveResultInfo, setLiveResultInfo] = useState<SportMarketLiveResult | undefined>(undefined);

    const useLiveResultQuery = useSportMarketLiveResultQuery(gameIdString, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (useLiveResultQuery.isSuccess && useLiveResultQuery.data) {
            setLiveResultInfo(useLiveResultQuery.data);
        }
    }, [useLiveResultQuery.isSuccess, useLiveResultQuery.data]);

    return (
        <RowContainer>
            <MainContainer showAMM={showAMM}>
                <HeaderWrapper>
                    <BackToLink
                        link={buildHref(ROUTES.Markets.Home)}
                        text={t('market.back')}
                        customStylingContainer={{ position: 'absolute', left: 0, top: 0, marginTop: 0 }}
                    />
                    {OP_INCENTIVIZED_LEAGUE.id == market.tags[0] &&
                        new Date(market.maturityDate) > OP_INCENTIVIZED_LEAGUE.startDate &&
                        new Date(market.maturityDate) < OP_INCENTIVIZED_LEAGUE.endDate && (
                            <Tooltip
                                overlay={
                                    <Trans
                                        i18nKey="markets.op-incentivized-tooltip"
                                        components={{
                                            duneLink: (
                                                <a
                                                    href="https://dune.com/leifu/overtime-npl-playoff-rewards-leaderboard"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                />
                                            ),
                                        }}
                                    />
                                }
                                component={
                                    <IncentivizedLeague>
                                        <IncentivizedTitle>{t('market.incentivized-market')}</IncentivizedTitle>
                                        <OPLogo width={25} height={25} />
                                    </IncentivizedLeague>
                                }
                            ></Tooltip>
                        )}
                </HeaderWrapper>
                <MatchInfo market={market} />
                {showStatus && (
                    <Status backgroundColor={isGameCancelled ? MAIN_COLORS.BACKGROUNDS.RED : MAIN_COLORS.LIGHT_GRAY}>
                        {isPendingResolution ? (
                            <ResultContainer>
                                <ResultLabel>
                                    {liveResultInfo?.homeScore + ' - ' + liveResultInfo?.awayScore}{' '}
                                    {liveResultInfo?.sportId &&
                                        liveResultInfo?.sportId >= 10 &&
                                        liveResultInfo.period == 2 && (
                                            <InfoLabel className="football">
                                                {'(' +
                                                    liveResultInfo?.scoreHomeByPeriod[0] +
                                                    ' - ' +
                                                    liveResultInfo?.scoreAwayByPeriod[0] +
                                                    ')'}
                                            </InfoLabel>
                                        )}
                                </ResultLabel>
                                {liveResultInfo?.status != GAME_STATUS.FINAL &&
                                    liveResultInfo?.status != GAME_STATUS.FULL_TIME && (
                                        <PeriodsContainer className="column">
                                            <InfoLabel>{`${t('markets.market-card.period')}: ${
                                                liveResultInfo?.period
                                            }`}</InfoLabel>
                                            <InfoLabel className="red">
                                                {liveResultInfo?.displayClock.replaceAll("'", '')}
                                                <InfoLabel className="blink">&prime;</InfoLabel>
                                            </InfoLabel>
                                        </PeriodsContainer>
                                    )}
                                {liveResultInfo?.sportId && liveResultInfo?.sportId < 10 && (
                                    <FlexDivRow>
                                        {liveResultInfo?.scoreHomeByPeriod.map((homePeriodResult, index) => {
                                            return (
                                                <PeriodContainer key={index}>
                                                    <InfoLabel className="gray">{index + 1}</InfoLabel>
                                                    <InfoLabel>{homePeriodResult}</InfoLabel>
                                                    <InfoLabel>{liveResultInfo.scoreAwayByPeriod[index]}</InfoLabel>
                                                </PeriodContainer>
                                            );
                                        })}
                                    </FlexDivRow>
                                )}
                            </ResultContainer>
                        ) : isGameCancelled ? (
                            t('markets.market-card.canceled')
                        ) : isGamePaused ? (
                            t('markets.market-card.paused')
                        ) : (
                            <ResultContainer>
                                <ResultLabel>
                                    {market.homeScore} - {market.awayScore}{' '}
                                    {liveResultInfo?.sportId &&
                                        liveResultInfo?.sportId >= 10 &&
                                        liveResultInfo.period == 2 && (
                                            <InfoLabel className="football">
                                                {'(' +
                                                    liveResultInfo?.scoreHomeByPeriod[0] +
                                                    ' - ' +
                                                    liveResultInfo?.scoreAwayByPeriod[0] +
                                                    ')'}
                                            </InfoLabel>
                                        )}
                                </ResultLabel>
                                {liveResultInfo?.sportId && liveResultInfo?.sportId < 10 && (
                                    <PeriodsContainer directionRow={true}>
                                        {liveResultInfo?.scoreHomeByPeriod.map((homePeriodResult, index) => {
                                            return (
                                                <PeriodContainer key={index}>
                                                    <InfoLabel className="gray">{index + 1}</InfoLabel>
                                                    <InfoLabel>{homePeriodResult}</InfoLabel>
                                                    <InfoLabel>{liveResultInfo.scoreAwayByPeriod[index]}</InfoLabel>
                                                </PeriodContainer>
                                            );
                                        })}
                                        <PeriodContainer>
                                            <InfoLabel className="gray">T</InfoLabel>
                                            <InfoLabel>{liveResultInfo?.homeScore}</InfoLabel>
                                            <InfoLabel>{liveResultInfo?.awayScore}</InfoLabel>
                                        </PeriodContainer>
                                    </PeriodsContainer>
                                )}
                            </ResultContainer>
                        )}
                    </Status>
                )}
                <>
                    <Positions markets={[market]} betType={BetType.WINNER} />
                    {childMarkets.doubleChanceMarkets.length > 0 && (
                        <Positions markets={childMarkets.doubleChanceMarkets} betType={BetType.DOUBLE_CHANCE} />
                    )}
                    {childMarkets.spreadMarkets.length > 0 && (
                        <Positions markets={childMarkets.spreadMarkets} betType={BetType.SPREAD} />
                    )}
                    {childMarkets.totalMarkets.length > 0 && (
                        <Positions markets={childMarkets.totalMarkets} betType={BetType.TOTAL} />
                    )}
                </>
                <Transactions market={market} />
            </MainContainer>
            {showAMM && (
                <SidebarContainer>
                    <Parlay />
                </SidebarContainer>
            )}
            {isMobile && showParlayMobileModal && <ParlayMobileModal onClose={() => setShowParlayMobileModal(false)} />}
            {isMobile && <FooterSidebarMobile setParlayMobileVisibility={setShowParlayMobileModal} />}
        </RowContainer>
    );
};

const RowContainer = styled(FlexDivRow)`
    margin-top: 40px;
    width: 100%;
    flex-direction: row;
    justify-content: center;
    @media (max-width: 575px) {
        margin-top: 30px;
    }
`;

const MainContainer = styled(FlexDivColumn)<{ showAMM: boolean }>`
    width: 100%;
    max-width: 800px;
    margin-right: ${(props) => (props.showAMM ? 10 : 0)}px;
    @media (max-width: 575px) {
        margin-right: 0;
    }
`;

const SidebarContainer = styled(FlexDivColumn)`
    max-width: 320px;
    @media (max-width: 950px) {
        display: none;
    }
`;

const HeaderWrapper = styled(FlexDivRow)`
    width: 100%;
    position: relative;
    align-items: center;
    @media (max-width: 950px) {
        flex-direction: column;
    }
`;

const IncentivizedLeague = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    cursor: pointer;
    right: 0;
    top: 0;
    @media (max-width: 950px) {
        position: static;
        margin-top: 20px;
    }
`;

const IncentivizedTitle = styled.span`
    font-size: 15px;
    padding-right: 5px;
`;

const Status = styled(FlexDivCentered)<{ backgroundColor?: string }>`
    width: 100%;
    border-radius: 15px;
    background-color: ${(props) => props.backgroundColor || MAIN_COLORS.LIGHT_GRAY};
    padding: 10px 50px;
    margin-bottom: 7px;
    font-weight: 600;
    font-size: 21px;
    line-height: 110%;
    text-transform: uppercase;
    color: ${MAIN_COLORS.TEXT.WHITE};
`;

const ResultContainer = styled(FlexDivColumnCentered)`
    align-items: center;
`;

const InfoLabel = styled.label`
    text-align: center;
    font-size: 18px;
    &.gray {
        color: ${(props) => props.theme.textColor.secondary};
    }

    &.red {
        color: #e26a78;
    }

    &.football {
        color: ${(props) => props.theme.textColor.secondary};
        font-size: 21px;
        font-weight: 700;
    }

    &.blink {
        color: #e26a78;
        font-weight: 700;
        animation: blinker 1.5s step-start infinite;
        margin-left: 3px;
    }

    @keyframes blinker {
        50% {
            opacity: 0;
        }
    }
`;

const ResultLabel = styled.label``;

const PeriodContainer = styled(FlexDivColumn)`
    margin: 0px 10px;
    font-size: 18px;
`;

const PeriodsContainer = styled(FlexDivColumn)<{ directionRow?: boolean }>`
    margin-top: 10px;
    flex-direction: ${(props) => (props.directionRow ? 'row' : 'column')};
`;

export default MarketDetails;
