import { ReactComponent as ArbitrumLogo } from 'assets/images/arbitrum-logo.svg';
import { ReactComponent as OPLogo } from 'assets/images/optimism-logo.svg';
import FooterSidebarMobile from 'components/FooterSidebarMobile';
import Toggle from 'components/Toggle';
import Tooltip from 'components/Tooltip';
import {
    INCENTIVIZED_EURO_COPA,
    INCENTIVIZED_LEAGUE,
    INCENTIVIZED_MLB,
    INCENTIVIZED_NHL,
    INCENTIVIZED_WIMBLEDON,
} from 'constants/markets';
import ROUTES from 'constants/routes';
import { ENETPULSE_SPORTS, JSON_ODDS_SPORTS, SPORTS_TAGS_MAP, SPORT_PERIODS_MAP, TAGS_LIST } from 'constants/tags';
import { GAME_STATUS } from 'constants/ui';
import { BetType } from 'enums/markets';
import { Network } from 'enums/network';
import { ToggleContainer } from 'pages/LiquidityPool/styled-components';
import Parlay from 'pages/Markets/Home/Parlay';
import ParlayMobileModal from 'pages/Markets/Home/Parlay/components/ParlayMobileModal';
import BackToLink from 'pages/Markets/components/BackToLink';
import useEnetpulseAdditionalDataQuery from 'queries/markets/useEnetpulseAdditionalDataQuery';
import useSportMarketLiveResultQuery from 'queries/markets/useSportMarketLiveResultQuery';
import queryString from 'query-string';
import React, { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { NetworkId } from 'thales-utils';
import { SportMarketChildMarkets, SportMarketInfo, SportMarketLiveResult, TagInfo } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { buildHref, navigateTo } from 'utils/routes';
import { getOrdinalNumberLabel } from 'utils/ui';
import useQueryParam from 'utils/useQueryParams';
import Web3 from 'web3';
import Transactions from '../Transactions';
import CombinedPositions from './components/CombinedPositions';
import MatchInfo from './components/MatchInfo';
import ParlayTransactions from './components/ParlayTransactions';
import Positions from './components/Positions';

type MarketDetailsPropType = {
    market: SportMarketInfo;
};

const MarketDetails: React.FC<MarketDetailsPropType> = ({ market }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const queryParams: { title?: string } = queryString.parse(location.search);

    const [metaTitle, setMetaTitle] = useQueryParam('title', queryParams?.title ? queryParams?.title : '');
    const [showParlayMobileModal, setShowParlayMobileModal] = useState(false);
    const [hidePausedMarkets, setHidePausedMarkets] = useState(true);

    const lastValidChildMarkets: SportMarketChildMarkets = {
        spreadMarkets: market.childMarkets.filter(
            (childMarket) => childMarket.betType == BetType.SPREAD && (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        totalMarkets: market.childMarkets.filter(
            (childMarket) => childMarket.betType == BetType.TOTAL && (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        doubleChanceMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.DOUBLE_CHANCE && (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        strikeOutsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_STRIKEOUTS &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        homeRunsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_HOMERUNS &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        passingYardsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_PASSING_YARDS &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        rushingYardsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_RUSHING_YARDS &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        receivingYardsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_RECEIVING_YARDS &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        passingTouchdownsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_PASSING_TOUCHDOWNS &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        fieldGoalsMadeMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_FIELD_GOALS_MADE &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        pitcherHitsAllowedMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_PITCHER_HITS_ALLOWED &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        hitsRecordedMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_HITS_RECORDED &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        pointsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_POINTS && (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        reboundsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_REBOUNDS &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        assistsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_ASSISTS &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        doubleDoubleMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_DOUBLE_DOUBLE &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        tripleDoubleMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_TRIPLE_DOUBLE &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        shotsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_SHOTS && (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        oneSiderTouchdownsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_TOUCHDOWNS &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        oneSiderGoalsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_GOALS && (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        receptionsMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_RECEPTIONS &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        firstTouchdownMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_FIRST_TOUCHDOWN &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        lastTouchdownMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_LAST_TOUCHDOWN &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
        threePointsMadeMarkets: market.childMarkets.filter(
            (childMarket) =>
                childMarket.betType == BetType.PLAYER_PROPS_3PTS_MADE &&
                (hidePausedMarkets ? !childMarket.isPaused : true)
        ),
    };

    const combinedMarkets = market.combinedMarketsData ? market.combinedMarketsData : [];

    useEffect(() => {
        if (!metaTitle) {
            setMetaTitle(`${market.homeTeam} vs ${market.awayTeam}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [market.awayTeam, market.homeTeam]);

    const isMounted = useRef(false);
    useEffect(() => {
        // skip first render
        if (isMounted.current) {
            navigateTo(ROUTES.Markets.Home);
        } else {
            isMounted.current = true;
        }
    }, [networkId]);

    const childMarkets: SportMarketChildMarkets = lastValidChildMarkets;

    const isGameStarted = market.maturityDate < new Date();
    const showAMM = !market.isResolved && !market.isCanceled && !isGameStarted && !market.isPaused;

    const leagueName = TAGS_LIST.find((t: TagInfo) => t.id == market.tags[0])?.label;
    const isGameCancelled = market.isCanceled || (!isGameStarted && market.isResolved);
    const isGameResolved = market.isResolved || market.isCanceled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const isGamePaused = market.isPaused && !isGameResolved;
    const showStatus = market.isResolved || market.isCanceled || isGameStarted || market.isPaused;
    const gameIdString = Web3.utils.hexToAscii(market.gameId);
    const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(market.tags[0]));
    const isJsonOddsSport = JSON_ODDS_SPORTS.includes(Number(market.tags[0]));
    const gameDate = new Date(market.maturityDate).toISOString().split('T')[0];
    const [liveResultInfo, setLiveResultInfo] = useState<SportMarketLiveResult | undefined>(undefined);

    const useLiveResultQuery = useSportMarketLiveResultQuery(gameIdString, {
        enabled: isAppReady && !isEnetpulseSport && !isJsonOddsSport,
    });

    const useEnetpulseLiveResultQuery = useEnetpulseAdditionalDataQuery(gameIdString, gameDate, market.tags[0], {
        enabled: isAppReady && isEnetpulseSport,
    });

    useEffect(() => {
        if (isEnetpulseSport) {
            if (useEnetpulseLiveResultQuery.isSuccess && useEnetpulseLiveResultQuery.data) {
                setLiveResultInfo(useEnetpulseLiveResultQuery.data);
            }
        } else {
            if (useLiveResultQuery.isSuccess && useLiveResultQuery.data) {
                setLiveResultInfo(useLiveResultQuery.data);
            }
        }
    }, [
        useLiveResultQuery,
        useLiveResultQuery.data,
        useEnetpulseLiveResultQuery,
        useEnetpulseLiveResultQuery.data,
        isEnetpulseSport,
    ]);

    const hideResultInfoPerPeriod = hideResultInfoPerPeriodForSports(Number(liveResultInfo?.sportId));

    return (
        <RowContainer>
            <MainContainer showAMM={showAMM}>
                <HeaderWrapper>
                    <BackToLink
                        link={buildHref(ROUTES.Markets.Home)}
                        text={t('market.back')}
                        customStylingContainer={{ position: 'absolute', left: 0, top: 0, marginTop: 0 }}
                    />
                    {INCENTIVIZED_LEAGUE.ids.includes(Number(market.tags[0])) &&
                        new Date(market.maturityDate) > INCENTIVIZED_LEAGUE.startDate &&
                        new Date(market.maturityDate) < INCENTIVIZED_LEAGUE.endDate && (
                            <Tooltip
                                overlay={
                                    <Trans
                                        i18nKey="markets.incentivized-tooltip"
                                        components={{
                                            detailsLink: (
                                                <a href={INCENTIVIZED_LEAGUE.link} target="_blank" rel="noreferrer" />
                                            ),
                                        }}
                                        values={{
                                            rewards:
                                                networkId == Network.OptimismMainnet
                                                    ? INCENTIVIZED_LEAGUE.opRewards
                                                    : networkId == Network.Arbitrum
                                                    ? INCENTIVIZED_LEAGUE.arbRewards
                                                    : '',
                                        }}
                                    />
                                }
                                component={
                                    <IncentivizedLeague>
                                        {networkId !== Network.Base ? (
                                            <IncentivizedTitle>{t('market.incentivized-market')}</IncentivizedTitle>
                                        ) : (
                                            ''
                                        )}
                                        {getNetworkLogo(networkId)}
                                    </IncentivizedLeague>
                                }
                            ></Tooltip>
                        )}
                    {INCENTIVIZED_EURO_COPA.ids.includes(Number(market.tags[0])) &&
                        new Date() > INCENTIVIZED_EURO_COPA.startDate &&
                        new Date() < INCENTIVIZED_EURO_COPA.endDate && (
                            <Tooltip
                                overlay={
                                    <Trans
                                        i18nKey="markets.incentivized-tooltip-euro-copa"
                                        components={{
                                            detailsLink: (
                                                <a
                                                    href={INCENTIVIZED_EURO_COPA.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                />
                                            ),
                                        }}
                                        values={{
                                            rewards: INCENTIVIZED_EURO_COPA.opRewards,
                                        }}
                                    />
                                }
                                component={
                                    <IncentivizedLeague>
                                        <IncentivizedTitle>{t('market.incentivized-market')}</IncentivizedTitle>
                                        {getNetworkLogo(NetworkId.OptimismMainnet)}
                                    </IncentivizedLeague>
                                }
                            ></Tooltip>
                        )}
                    {INCENTIVIZED_WIMBLEDON.ids.includes(Number(market.tags[0])) &&
                        new Date() > INCENTIVIZED_WIMBLEDON.startDate &&
                        new Date() < INCENTIVIZED_WIMBLEDON.endDate && (
                            <Tooltip
                                overlay={
                                    <Trans
                                        i18nKey="markets.incentivized-tooltip-wimbledon"
                                        components={{
                                            detailsLink: (
                                                <a
                                                    href={INCENTIVIZED_WIMBLEDON.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                />
                                            ),
                                        }}
                                        values={{
                                            rewards: INCENTIVIZED_WIMBLEDON.opRewards,
                                        }}
                                    />
                                }
                                component={
                                    <IncentivizedLeague>
                                        <IncentivizedTitle>{t('market.incentivized-market')}</IncentivizedTitle>
                                        {getNetworkLogo(NetworkId.OptimismMainnet)}
                                    </IncentivizedLeague>
                                }
                            ></Tooltip>
                        )}
                    {INCENTIVIZED_NHL.ids.includes(Number(market.tags[0])) &&
                        new Date() > INCENTIVIZED_NHL.startDate &&
                        new Date() < INCENTIVIZED_NHL.endDate && (
                            <Tooltip
                                overlay={
                                    <Trans
                                        i18nKey="markets.incentivized-tooltip-nhl-mlb"
                                        components={{
                                            detailsLink: (
                                                <a href={INCENTIVIZED_NHL.link} target="_blank" rel="noreferrer" />
                                            ),
                                        }}
                                        values={{
                                            league: leagueName,
                                            rewards: INCENTIVIZED_NHL.arbRewards,
                                        }}
                                    />
                                }
                                component={
                                    <IncentivizedLeague>
                                        <IncentivizedTitle>{t('market.incentivized-market')}</IncentivizedTitle>
                                        {getNetworkLogo(NetworkId.Arbitrum)}
                                    </IncentivizedLeague>
                                }
                            ></Tooltip>
                        )}
                    {INCENTIVIZED_MLB.ids.includes(Number(market.tags[0])) &&
                        new Date() > INCENTIVIZED_MLB.startDate &&
                        new Date() < INCENTIVIZED_MLB.endDate && (
                            <Tooltip
                                overlay={
                                    <Trans
                                        i18nKey="markets.incentivized-tooltip-nhl-mlb"
                                        components={{
                                            detailsLink: (
                                                <a href={INCENTIVIZED_MLB.link} target="_blank" rel="noreferrer" />
                                            ),
                                        }}
                                        values={{
                                            league: leagueName,
                                            rewards: INCENTIVIZED_MLB.arbRewards,
                                        }}
                                    />
                                }
                                component={
                                    <IncentivizedLeague>
                                        <IncentivizedTitle>{t('market.incentivized-market')}</IncentivizedTitle>
                                        {getNetworkLogo(NetworkId.Arbitrum)}
                                    </IncentivizedLeague>
                                }
                            ></Tooltip>
                        )}
                </HeaderWrapper>
                <MatchInfo market={market} liveResultInfo={liveResultInfo} isEnetpulseSport={isEnetpulseSport} />
                {showStatus && (
                    <Status backgroundColor={isGameCancelled ? theme.status.canceled : theme.background.secondary}>
                        {isPendingResolution ? (
                            !isEnetpulseSport && !isJsonOddsSport ? (
                                <ResultContainer>
                                    <ResultLabel>
                                        {liveResultInfo?.homeScore + ' - ' + liveResultInfo?.awayScore}{' '}
                                        {SPORTS_TAGS_MAP['Soccer'].includes(Number(liveResultInfo?.sportId)) &&
                                            liveResultInfo?.period == 2 && (
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
                                            <PeriodsContainer>
                                                {liveResultInfo?.status == GAME_STATUS.HALF_TIME && (
                                                    <InfoLabel>{t('markets.market-card.half-time')}</InfoLabel>
                                                )}
                                                {liveResultInfo?.status != GAME_STATUS.HALF_TIME && (
                                                    <>
                                                        <InfoLabel>
                                                            {` ${getOrdinalNumberLabel(
                                                                Number(liveResultInfo?.period)
                                                            )} ${t(
                                                                `markets.market-card.${
                                                                    SPORT_PERIODS_MAP[Number(liveResultInfo?.sportId)]
                                                                }`
                                                            )}`}
                                                        </InfoLabel>
                                                        <InfoLabel className="red">
                                                            {liveResultInfo?.displayClock.replaceAll("'", '')}
                                                            <InfoLabel className="blink">&prime;</InfoLabel>
                                                        </InfoLabel>
                                                    </>
                                                )}
                                            </PeriodsContainer>
                                        )}
                                    {!SPORTS_TAGS_MAP['Soccer'].includes(Number(liveResultInfo?.sportId)) && (
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
                            ) : (
                                t('markets.market-card.pending')
                            )
                        ) : isGameCancelled ? (
                            t('markets.market-card.canceled')
                        ) : isGamePaused ? (
                            t('markets.market-card.paused')
                        ) : (
                            <ResultContainer>
                                <ResultLabel>
                                    {market.isOneSideMarket
                                        ? market.homeScore == 1
                                            ? t('markets.market-card.race-winner')
                                            : t('markets.market-card.no-win')
                                        : Number(liveResultInfo?.sportId) != 9007
                                        ? `${market.homeScore} - ${market.awayScore}`
                                        : ''}
                                    {SPORTS_TAGS_MAP['Soccer'].includes(Number(liveResultInfo?.sportId)) &&
                                        liveResultInfo?.period == 2 && (
                                            <InfoLabel className="football">
                                                {'(' +
                                                    liveResultInfo?.scoreHomeByPeriod[0] +
                                                    ' - ' +
                                                    liveResultInfo?.scoreAwayByPeriod[0] +
                                                    ')'}
                                            </InfoLabel>
                                        )}
                                    {Number(liveResultInfo?.sportId) == 9007 ? (
                                        <>
                                            {Number(market.homeScore) > 0 ? 'W - L' : 'L - W'}
                                            <InfoLabel className="ufc">
                                                {`(${t('market.number-of-rounds')}: ` +
                                                    `${
                                                        Number(market.homeScore) > 0
                                                            ? market.homeScore
                                                            : market.awayScore
                                                    }` +
                                                    ')'}
                                            </InfoLabel>
                                        </>
                                    ) : (
                                        ''
                                    )}
                                </ResultLabel>
                                {hideResultInfoPerPeriod && (
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
                    <ToggleContainer>
                        <Toggle
                            label={{
                                firstLabel: t('markets.market-card.toggle.hide-paused-markets'),
                                secondLabel: t('markets.market-card.toggle.show-paused-markets'),
                            }}
                            active={!hidePausedMarkets}
                            dotSize="18px"
                            dotBackground={theme.background.secondary}
                            dotBorder={`3px solid ${theme.borderColor.quaternary}`}
                            handleClick={() => {
                                setHidePausedMarkets(!hidePausedMarkets);
                            }}
                        />
                    </ToggleContainer>
                    <Positions markets={[market]} betType={BetType.WINNER} showOdds={showAMM} />
                    {childMarkets.doubleChanceMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.doubleChanceMarkets}
                            betType={BetType.DOUBLE_CHANCE}
                            areDoubleChanceMarkets
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.spreadMarkets.length > 0 && (
                        <Positions markets={childMarkets.spreadMarkets} betType={BetType.SPREAD} showOdds={showAMM} />
                    )}
                    {childMarkets.totalMarkets.length > 0 && (
                        <Positions markets={childMarkets.totalMarkets} betType={BetType.TOTAL} showOdds={showAMM} />
                    )}
                    {combinedMarkets.length > 0 && <CombinedPositions combinedMarkets={combinedMarkets} />}
                    {childMarkets.strikeOutsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.strikeOutsMarkets}
                            betType={BetType.PLAYER_PROPS_STRIKEOUTS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.homeRunsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.homeRunsMarkets}
                            betType={BetType.PLAYER_PROPS_HOMERUNS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.rushingYardsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.rushingYardsMarkets}
                            betType={BetType.PLAYER_PROPS_RUSHING_YARDS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.passingYardsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.passingYardsMarkets}
                            betType={BetType.PLAYER_PROPS_PASSING_YARDS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.receivingYardsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.receivingYardsMarkets}
                            betType={BetType.PLAYER_PROPS_RECEIVING_YARDS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.passingTouchdownsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.passingTouchdownsMarkets}
                            betType={BetType.PLAYER_PROPS_PASSING_TOUCHDOWNS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.fieldGoalsMadeMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.fieldGoalsMadeMarkets}
                            betType={BetType.PLAYER_PROPS_FIELD_GOALS_MADE}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.pitcherHitsAllowedMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.pitcherHitsAllowedMarkets}
                            betType={BetType.PLAYER_PROPS_PITCHER_HITS_ALLOWED}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.hitsRecordedMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.hitsRecordedMarkets}
                            betType={BetType.PLAYER_PROPS_HITS_RECORDED}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.pointsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.pointsMarkets}
                            betType={BetType.PLAYER_PROPS_POINTS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.reboundsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.reboundsMarkets}
                            betType={BetType.PLAYER_PROPS_REBOUNDS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.assistsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.assistsMarkets}
                            betType={BetType.PLAYER_PROPS_ASSISTS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.threePointsMadeMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.threePointsMadeMarkets}
                            betType={BetType.PLAYER_PROPS_3PTS_MADE}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.doubleDoubleMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.doubleDoubleMarkets}
                            betType={BetType.PLAYER_PROPS_DOUBLE_DOUBLE}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.tripleDoubleMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.tripleDoubleMarkets}
                            betType={BetType.PLAYER_PROPS_TRIPLE_DOUBLE}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.shotsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.shotsMarkets}
                            betType={BetType.PLAYER_PROPS_SHOTS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.oneSiderTouchdownsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.oneSiderTouchdownsMarkets}
                            betType={BetType.PLAYER_PROPS_TOUCHDOWNS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.oneSiderGoalsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.oneSiderGoalsMarkets}
                            betType={BetType.PLAYER_PROPS_GOALS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.receptionsMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.receptionsMarkets}
                            betType={BetType.PLAYER_PROPS_RECEPTIONS}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.firstTouchdownMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.firstTouchdownMarkets}
                            betType={BetType.PLAYER_PROPS_FIRST_TOUCHDOWN}
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.lastTouchdownMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.lastTouchdownMarkets}
                            betType={BetType.PLAYER_PROPS_LAST_TOUCHDOWN}
                            showOdds={showAMM}
                        />
                    )}
                </>
                <Transactions market={market} />
                <ParlayTransactions market={market} />
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

const hideResultInfoPerPeriodForSports = (sportId: number) => {
    return (
        !SPORTS_TAGS_MAP['Soccer'].includes(Number(sportId)) &&
        !SPORTS_TAGS_MAP['eSports'].includes(sportId) &&
        !SPORTS_TAGS_MAP['MMA'].includes(sportId) &&
        !SPORTS_TAGS_MAP['Cricket'].includes(sportId) &&
        !SPORTS_TAGS_MAP['Motosport'].includes(sportId) &&
        sportId != 9399
    );
};

const getNetworkLogo = (networkId: number) => {
    switch (networkId) {
        case Network.OptimismMainnet:
            return <OPLogo />;
        case Network.Arbitrum:
            return <ArbitrumLogo />;
        default:
            return <></>;
    }
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
    svg {
        height: 25px;
    }
`;

const IncentivizedTitle = styled.span`
    font-size: 15px;
    padding-right: 5px;
`;

const Status = styled(FlexDivCentered)<{ backgroundColor?: string }>`
    width: 100%;
    border-radius: 15px;
    background-color: ${(props) => props.backgroundColor || props.theme.background.secondary};
    padding: 10px 50px;
    margin-bottom: 7px;
    font-weight: 600;
    font-size: 21px;
    line-height: 110%;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
`;

const ResultContainer = styled(FlexDivColumnCentered)`
    align-items: center;
`;

const InfoLabel = styled.label`
    text-align: center;
    font-size: 18px;
    text-transform: uppercase;
    &.gray {
        color: ${(props) => props.theme.textColor.secondary};
    }

    &.red {
        color: ${(props) => props.theme.status.loss};
    }

    &.football {
        color: ${(props) => props.theme.textColor.secondary};
        font-size: 21px;
        font-weight: 700;
    }
    &.ufc {
        display: flex;
        color: ${(props) => props.theme.textColor.secondary};
        font-size: 14px;
        font-weight: 700;
    }

    &.blink {
        color: ${(props) => props.theme.status.loss};
        font-weight: 700;
        animation: blinker 1.5s step-start infinite;
    }

    @keyframes blinker {
        50% {
            opacity: 0;
        }
    }
`;

const ResultLabel = styled.label`
    text-align: center;
`;

const PeriodContainer = styled(FlexDivColumn)`
    margin: 0px 10px;
    font-size: 18px;
`;

const PeriodsContainer = styled(FlexDivColumn)<{ directionRow?: boolean }>`
    margin-top: 10px;
    flex-direction: ${(props) => (props.directionRow ? 'row' : 'column')};
`;

export default MarketDetails;
