import liveAnimationData from 'assets/lotties/live-markets-filter.json';
import SPAAnchor from 'components/SPAAnchor';
import TimeRemaining from 'components/TimeRemaining';
import Tooltip from 'components/Tooltip';
import { FUTURES_MAIN_VIEW_DISPLAY_COUNT, MEDIUM_ODDS } from 'constants/markets';
import { PLAYER_PROPS_SPECIAL_SPORTS } from 'constants/sports';
import { SportFilter } from 'enums/markets';
import { RiskManagementConfig } from 'enums/riskManagement';
import _, { isEqual } from 'lodash';
import Lottie from 'lottie-react';
import {
    getLeagueLabel,
    getLeaguePeriodType,
    getLeagueTooltipKey,
    isFuturesMarket,
    League,
    MarketType,
    PeriodType,
    Sport,
} from 'overtime-utils';
import useGameMultipliersQuery from 'queries/overdrop/useGameMultipliersQuery';
import useRiskManagementConfigQuery from 'queries/riskManagement/useRiskManagementConfig';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import {
    getIsMarketSelected,
    getIsThreeWayView,
    getMarketTypeFilter,
    getMarketTypeGroupFilter,
    getSelectedMarket,
    getSportFilter,
    setSelectedMarket,
} from 'redux/modules/market';
import { formatShortDateWithTime } from 'thales-utils';
import { SportMarket } from 'types/markets';
import { RiskManagementLeaguesAndTypes } from 'types/riskManagement';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { getLeagueFlagSource, getOnImageError, getOnPlayerImageError, getTeamImageSource } from 'utils/images';
import {
    getMarketPlayerPropsMarketsForGroupFilter,
    getMarketPlayerPropsMarketsForProp,
    getMarketPlayerPropsMarketsForSport,
    isOddValid,
} from 'utils/marketsV2';
import { buildMarketLink } from 'utils/routes';
import { displayGameClock, displayGamePeriod } from 'utils/ui';
import { useChainId } from 'wagmi';
import PositionsV2 from '../../Market/MarketDetailsV2/components/PositionsV2';
import MatchStatus from './components/MatchStatus';
import {
    Arrow,
    Blink,
    ClubLogo,
    CurrentResultContainer,
    ExternalArrow,
    Fire,
    FireContainer,
    FireText,
    GameOfLabel,
    LeagueFlag,
    liveBlinkStyle,
    liveBlinkStyleMobile,
    LiveIndicatorContainer,
    MainContainer,
    MarketsCountWrapper,
    MatchInfo,
    MatchInfoContainer,
    MatchInfoLabel,
    PeriodResultContainer,
    ResultLabel,
    SecondaryResultsWrapper,
    TeamLogosContainer,
    TeamNameLabel,
    TeamNamesContainer,
    TeamsInfoContainer,
    TournamentNameLabel,
    Wrapper,
} from './styled-components';

type MarketRowCardProps = {
    market: SportMarket;
    language: string;
    floatingOddsTitles?: boolean;
    oddsTitlesHidden?: boolean;
    showLeagueInfo?: boolean;
};

const MarketListCard: React.FC<MarketRowCardProps> = memo(
    ({ market, language, oddsTitlesHidden, floatingOddsTitles, showLeagueInfo }) => {
        const { t } = useTranslation();
        const dispatch = useDispatch();
        const networkId = useChainId();

        const isMarketSelected = useSelector(getIsMarketSelected);
        const isThreeWayView = useSelector(getIsThreeWayView);
        const selectedMarket = useSelector(getSelectedMarket);
        const marketTypeFilter = useSelector(getMarketTypeFilter);
        const marketTypeGroupFilter = useSelector(getMarketTypeGroupFilter);
        const sportFilter = useSelector(getSportFilter);
        const isMobile = useSelector(getIsMobile);

        const isPlayerPropsMarket = useMemo(() => sportFilter === SportFilter.PlayerProps, [sportFilter]);

        const [homeLogoSrc, setHomeLogoSrc] = useState(
            getTeamImageSource(isPlayerPropsMarket ? market.playerProps.playerName : market.homeTeam, market.leagueId)
        );
        const [awayLogoSrc, setAwayLogoSrc] = useState(
            getTeamImageSource(isPlayerPropsMarket ? market.playerProps.playerName : market.awayTeam, market.leagueId)
        );

        const riskManagementLeaguesQuery = useRiskManagementConfigQuery(
            RiskManagementConfig.LEAGUES,
            { networkId },
            { enabled: !!market.live }
        );

        const riskManagementLeaguesWithTypes = useMemo(() => {
            if (
                riskManagementLeaguesQuery.isSuccess &&
                riskManagementLeaguesQuery.data &&
                Object.keys(riskManagementLeaguesQuery.data).length
            ) {
                const queryData = riskManagementLeaguesQuery.data as RiskManagementLeaguesAndTypes;
                const leagues = _.uniq(
                    queryData.leagues
                        .filter((leagueInfo) => leagueInfo.leagueId === market.leagueId && leagueInfo.enabled)
                        .map((leagueInfo) => leagueInfo.marketName)
                );
                return {
                    leagues,
                    spreadTypes: queryData.spreadTypes,
                    totalTypes: queryData.totalTypes,
                };
            } else {
                return { leagues: [], spreadTypes: [], totalTypes: [] };
            }
        }, [riskManagementLeaguesQuery.isSuccess, riskManagementLeaguesQuery.data, market.leagueId]);

        useEffect(() => {
            setHomeLogoSrc(
                getTeamImageSource(
                    isPlayerPropsMarket ? market.playerProps.playerName : market.homeTeam,
                    market.leagueId
                )
            );
            setAwayLogoSrc(
                getTeamImageSource(
                    isPlayerPropsMarket ? market.playerProps.playerName : market.awayTeam,
                    market.leagueId
                )
            );
        }, [market.homeTeam, market.awayTeam, market.leagueId, market.playerProps.playerName, isPlayerPropsMarket]);

        const isGameStarted = market.maturityDate < new Date();
        const isGameOpen = market.isOpen && !isGameStarted;
        const isGameRegularlyResolved = market.isResolved && !market.isCancelled;
        const isGameLive = !!market.live;
        const isGamePaused = market.isPaused;
        const isFutures = isFuturesMarket(market.typeId);

        const spreadMarket = useMemo(() => {
            const spreadMarkets = market.childMarkets.filter((childMarket) =>
                childMarket.leagueId === League.US_ELECTION
                    ? childMarket.typeId === MarketType.US_ELECTION_POPULAR_VOTE_WINNER
                    : childMarket.typeId === MarketType.SPREAD
            );

            const mainSpreadMarket =
                spreadMarkets.length > 0
                    ? spreadMarkets.reduce(function (prev, curr) {
                          return Math.abs(curr.odds[0] - MEDIUM_ODDS) < Math.abs(prev.odds[0] - MEDIUM_ODDS)
                              ? curr
                              : prev;
                      })
                    : undefined;

            const isSpreadTypeSupported = riskManagementLeaguesWithTypes.leagues.find((betType) =>
                riskManagementLeaguesWithTypes.spreadTypes.includes(betType)
            );
            if (market.live && !mainSpreadMarket && isSpreadTypeSupported) {
                return { ...market, type: 'spread', typeId: MarketType.SPREAD, odds: [0, 0], line: Infinity };
            }

            return mainSpreadMarket;
        }, [market, riskManagementLeaguesWithTypes]);

        const totalMarket = useMemo(() => {
            const totalMarkets = market.childMarkets.filter((childMarket) =>
                childMarket.leagueId === League.US_ELECTION
                    ? childMarket.typeId === MarketType.US_ELECTION_WINNING_PARTY
                    : childMarket.typeId === MarketType.TOTAL
            );

            const mainTotalMarket =
                totalMarkets.length > 0
                    ? totalMarkets.reduce(function (prev, curr) {
                          return Math.abs(curr.odds[0] - MEDIUM_ODDS) < Math.abs(prev.odds[0] - MEDIUM_ODDS)
                              ? curr
                              : prev;
                      })
                    : undefined;

            const isTotalTypeSupported = riskManagementLeaguesWithTypes.leagues.find((betType) =>
                riskManagementLeaguesWithTypes.totalTypes.includes(betType)
            );

            if (market.live && !mainTotalMarket && isTotalTypeSupported) {
                return { ...market, type: 'total', typeId: MarketType.TOTAL, odds: [0, 0], line: Infinity };
            }

            return mainTotalMarket;
        }, [market, riskManagementLeaguesWithTypes]);

        const marketTypeFilterMarket = useMemo(() => {
            if (marketTypeFilter === undefined) return undefined;
            if (marketTypeFilter === MarketType.WINNER) return market;

            const marketTypeFilterMarkets = market.childMarkets.filter(
                (childMarket) => childMarket.typeId === marketTypeFilter
            );

            return marketTypeFilterMarkets.length > 0
                ? marketTypeFilterMarkets.reduce(function (prev, curr) {
                      return Math.abs(curr.odds[0] - MEDIUM_ODDS) < Math.abs(prev.odds[0] - MEDIUM_ODDS) ? curr : prev;
                  })
                : undefined;
        }, [market, marketTypeFilter]);

        const playerPropsMarkets = useMemo(() => {
            if (!isPlayerPropsMarket) {
                return null;
            }
            if (marketTypeGroupFilter) {
                return getMarketPlayerPropsMarketsForGroupFilter(market, marketTypeGroupFilter);
            }
            if (PLAYER_PROPS_SPECIAL_SPORTS.includes(market.sport)) {
                return getMarketPlayerPropsMarketsForProp(market);
            }

            return getMarketPlayerPropsMarketsForSport(market);
        }, [market, isPlayerPropsMarket, marketTypeGroupFilter]);

        const areChildMarketsOddsValid = market.childMarkets.some((childMarket) =>
            childMarket.odds.some((odd) => isOddValid(odd))
        );

        const areOddsValid = market.odds.some((odd) => isOddValid(odd));

        const hideGame = isGameLive ? false : isGameOpen && !areOddsValid && !areChildMarketsOddsValid;
        const isColumnView =
            marketTypeFilter === undefined &&
            isThreeWayView &&
            !isMarketSelected &&
            (isGameOpen || isGameLive) &&
            !isMobile;
        const isTwoPositionalMarket = market.odds.length === 2 || isFutures;

        const selected = isPlayerPropsMarket
            ? selectedMarket?.gameId == market.gameId && selectedMarket?.playerName == market.playerProps.playerName
            : selectedMarket?.gameId == market.gameId;

        let marketsCount = market.childMarkets.length;
        if (isColumnView || isGameLive) {
            if (spreadMarket) {
                marketsCount -= 1;
            }
            if (totalMarket) {
                marketsCount -= 1;
            }
        }
        if (playerPropsMarkets?.length) {
            if (playerPropsMarkets?.[0] && playerPropsMarkets?.[0]?.line !== Infinity) {
                marketsCount -= 1;
            }

            if (isColumnView) {
                if (playerPropsMarkets?.[1] && playerPropsMarkets?.[1]?.line !== Infinity) {
                    marketsCount -= 1;
                }
                if (playerPropsMarkets?.[2] && playerPropsMarkets?.[2]?.line !== Infinity) {
                    marketsCount -= 1;
                }
            }
        }

        if (isFutures) {
            marketsCount += market.odds.filter((odd) => odd).length - FUTURES_MAIN_VIEW_DISPLAY_COUNT;
        }
        marketsCount = marketsCount < 0 ? 0 : marketsCount;

        const leagueTooltipKey = getLeagueTooltipKey(market.leagueId);

        const gameMultipliersQuery = useGameMultipliersQuery();

        const overdropGameMultiplier = useMemo(() => {
            const gameMultipliers =
                gameMultipliersQuery.isSuccess && gameMultipliersQuery.data ? gameMultipliersQuery.data : [];
            return gameMultipliers.find((multiplier) => multiplier.gameId === market.gameId);
        }, [gameMultipliersQuery.data, gameMultipliersQuery.isSuccess, market.gameId]);

        const leagueFlagRef = useRef<HTMLImageElement>(null);

        const showHeaderTournamentName =
            market?.tournamentName && (isColumnView || isMarketSelected || isMobile) && !isPlayerPropsMarket;

        const getMainContainerContent = () => (
            <>
                {showHeaderTournamentName && (
                    <TournamentNameLabel
                        selected={selected}
                        isLeagueInfoVisible={showLeagueInfo}
                        isBoosted={!isPlayerPropsMarket && !!overdropGameMultiplier}
                    >
                        {market?.tournamentName}{' '}
                    </TournamentNameLabel>
                )}
                <MainContainer
                    isBoosted={!isPlayerPropsMarket && !!overdropGameMultiplier && !showHeaderTournamentName}
                    isGameOpen={isGameOpen || isGameLive}
                    hasTournamentName={!!showHeaderTournamentName}
                >
                    <MatchInfoContainer
                        onClick={(event) => {
                            const isMobileLeagueFlagClick = isMobile && event.target === leagueFlagRef.current;
                            if (!isMobileLeagueFlagClick && (isGameOpen || isGameLive)) {
                                if (isPlayerPropsMarket) {
                                    dispatch(
                                        setSelectedMarket({
                                            gameId: market.gameId,
                                            sport: market.sport,
                                            live: market.live,
                                            playerName: market.playerProps.playerName,
                                        })
                                    );
                                } else {
                                    dispatch(
                                        setSelectedMarket({
                                            gameId: market.gameId,
                                            sport: market.sport,
                                            live: market.live,
                                        })
                                    );
                                }
                            }
                        }}
                    >
                        <MatchInfo marginTop={isGameLive ? '3px' : ''} selected={selected}>
                            {showLeagueInfo && (
                                <Tooltip overlay={getLeagueLabel(market.leagueId)}>
                                    <LeagueFlag
                                        ref={leagueFlagRef}
                                        alt={market.leagueId.toString()}
                                        src={getLeagueFlagSource(market.leagueId)}
                                        hasTournamentName={!!showHeaderTournamentName}
                                    />
                                </Tooltip>
                            )}
                            {isGameLive ? (
                                <>
                                    <LiveIndicatorContainer>
                                        <Lottie
                                            autoplay={true}
                                            animationData={liveAnimationData}
                                            loop={true}
                                            style={isMobile ? liveBlinkStyleMobile : liveBlinkStyle}
                                        />
                                        <MatchInfoLabel selected={selected}>
                                            {t(`markets.market-card.live`)}
                                        </MatchInfoLabel>
                                    </LiveIndicatorContainer>
                                    <MatchInfoLabel>
                                        {displayGameClock(market) ? market.gameClock : ''}
                                        {displayGameClock(market) &&
                                        market.gamePeriod != null &&
                                        market.gamePeriod != undefined &&
                                        [PeriodType.HALF, PeriodType.QUARTER].includes(
                                            getLeaguePeriodType(market.leagueId)
                                        ) ? (
                                            <Blink>&prime;</Blink>
                                        ) : (
                                            ''
                                        )}
                                        {displayGameClock(market) && ' '}
                                        {displayGamePeriod(market)}
                                    </MatchInfoLabel>
                                </>
                            ) : (
                                !isPlayerPropsMarket && (
                                    <Tooltip
                                        overlay={
                                            <>
                                                {t(`markets.market-card.starts-in`)}:{' '}
                                                <TimeRemaining end={market.maturityDate} fontSize={11} />
                                            </>
                                        }
                                    >
                                        <MatchInfoLabel>
                                            {formatShortDateWithTime(new Date(market.maturityDate))}{' '}
                                        </MatchInfoLabel>
                                    </Tooltip>
                                )
                            )}
                            <MatchInfoLabel>
                                {!isColumnView && !isMarketSelected && !isMobile && !isPlayerPropsMarket && (
                                    <>{`${market.tournamentName ? ` | ${market.tournamentName}` : ''}`}</>
                                )}
                                {leagueTooltipKey && !isPlayerPropsMarket && (
                                    <Tooltip overlay={t(leagueTooltipKey)} iconFontSize={12} marginLeft={2} />
                                )}
                            </MatchInfoLabel>
                        </MatchInfo>
                        <TeamsInfoContainer isPlayerPropsMarket={isPlayerPropsMarket}>
                            <TeamLogosContainer
                                isColumnView={isColumnView}
                                isTwoPositionalMarket={isTwoPositionalMarket}
                                isOneSideMarket={market.isOneSideMarket}
                            >
                                <ClubLogo
                                    alt="Home team logo"
                                    src={homeLogoSrc}
                                    onError={
                                        isPlayerPropsMarket
                                            ? getOnPlayerImageError(setHomeLogoSrc)
                                            : getOnImageError(setHomeLogoSrc, market.leagueId)
                                    }
                                    isColumnView={isColumnView}
                                    isFutures={isFutures}
                                />
                                {!market.isOneSideMarket && !isFutures && (
                                    <>
                                        <ClubLogo
                                            alt="Away team logo"
                                            src={awayLogoSrc}
                                            onError={getOnImageError(setAwayLogoSrc, market.leagueId)}
                                            awayTeam={true}
                                            isColumnView={isColumnView}
                                            isFutures={isFutures}
                                        />
                                    </>
                                )}
                            </TeamLogosContainer>
                            <TeamNamesContainer
                                isColumnView={isColumnView}
                                isTwoPositionalMarket={isTwoPositionalMarket}
                                isGameOpen={isGameOpen || isGameLive}
                            >
                                <TeamNameLabel
                                    isLive={isGameLive}
                                    isColumnView={isColumnView}
                                    isMarketSelected={isMarketSelected}
                                >
                                    {isPlayerPropsMarket
                                        ? market.playerProps.playerName
                                        : market.isOneSideMarket
                                        ? fixOneSideMarketCompetitorName(market.homeTeam)
                                        : market.homeTeam}
                                </TeamNameLabel>
                                {!market.isOneSideMarket && (
                                    <>
                                        {isMobile && (isGameOpen || isGameLive) && (
                                            <TeamNameLabel
                                                isLive={isGameLive}
                                                isColumnView={isColumnView}
                                                isMarketSelected={isMarketSelected}
                                            >
                                                {' '}
                                                -{' '}
                                            </TeamNameLabel>
                                        )}
                                        <TeamNameLabel
                                            isLive={isGameLive}
                                            isColumnView={isColumnView}
                                            isMarketSelected={isMarketSelected}
                                        >
                                            {market.awayTeam}
                                        </TeamNameLabel>
                                    </>
                                )}
                            </TeamNamesContainer>
                            {isGameLive && (
                                <>
                                    <CurrentResultContainer isColumnView={isColumnView}>
                                        <ResultLabel isColumnView={isColumnView} isMarketSelected={isMarketSelected}>
                                            {market.homeScore}
                                        </ResultLabel>
                                        {isMobile && (isGameOpen || isGameLive) && (
                                            <ResultLabel
                                                isColumnView={isColumnView}
                                                isMarketSelected={isMarketSelected}
                                            >
                                                {' '}
                                                -{' '}
                                            </ResultLabel>
                                        )}
                                        <ResultLabel isColumnView={isColumnView} isMarketSelected={isMarketSelected}>
                                            {market.awayScore}
                                        </ResultLabel>
                                    </CurrentResultContainer>
                                    {market.sport == Sport.TENNIS && (
                                        <SecondaryResultsWrapper>
                                            {market.homeScoreByPeriod.map((score: number, index: number) => (
                                                <PeriodResultContainer
                                                    key={index}
                                                    isColumnView={isColumnView}
                                                    selected={selected}
                                                >
                                                    <ResultLabel
                                                        isColumnView={isColumnView}
                                                        isMarketSelected={isMarketSelected}
                                                    >
                                                        {score}
                                                    </ResultLabel>
                                                    {isMobile && (isGameOpen || isGameLive) && (
                                                        <ResultLabel
                                                            isColumnView={isColumnView}
                                                            isMarketSelected={isMarketSelected}
                                                        >
                                                            {' '}
                                                            -{' '}
                                                        </ResultLabel>
                                                    )}
                                                    <ResultLabel
                                                        isColumnView={isColumnView}
                                                        isMarketSelected={isMarketSelected}
                                                    >
                                                        {market.awayScoreByPeriod[index]}
                                                    </ResultLabel>
                                                </PeriodResultContainer>
                                            ))}
                                        </SecondaryResultsWrapper>
                                    )}
                                </>
                            )}
                        </TeamsInfoContainer>
                    </MatchInfoContainer>
                    {!isMarketSelected && (
                        <>
                            {isGameLive && !isGamePaused ? (
                                <>
                                    <PositionsV2
                                        markets={[marketTypeFilterMarket ? marketTypeFilterMarket : market]}
                                        marketType={
                                            marketTypeFilter && marketTypeFilterMarket
                                                ? marketTypeFilter
                                                : market.typeId
                                        }
                                        isGameOpen={isGameLive}
                                        isGameLive={isGameLive}
                                        isMainPageView
                                        isColumnView={isColumnView}
                                    />
                                    {isColumnView && !isMobile && spreadMarket && (
                                        <PositionsV2
                                            markets={[spreadMarket]}
                                            marketType={MarketType.SPREAD}
                                            isGameOpen={isGameOpen}
                                            isMainPageView
                                            isColumnView={isColumnView}
                                        />
                                    )}
                                    {isColumnView && !isMobile && totalMarket && (
                                        <PositionsV2
                                            markets={[totalMarket]}
                                            marketType={MarketType.TOTAL}
                                            isGameOpen={isGameOpen}
                                            isMainPageView
                                            isColumnView={isColumnView}
                                        />
                                    )}
                                    <MarketsCountWrapper
                                        hidden={marketsCount === 0}
                                        onClick={() => {
                                            if (isPlayerPropsMarket) {
                                                dispatch(
                                                    setSelectedMarket({
                                                        gameId: market.gameId,
                                                        sport: market.sport,
                                                        live: market.live,
                                                        playerName: market.playerProps.playerName,
                                                    })
                                                );
                                            } else {
                                                dispatch(
                                                    setSelectedMarket({
                                                        gameId: market.gameId,
                                                        sport: market.sport,
                                                        live: market.live,
                                                    })
                                                );
                                            }
                                        }}
                                    >
                                        {`+${marketsCount}`}
                                        {!isMobile && <Arrow className={'icon icon--arrow-down'} />}
                                    </MarketsCountWrapper>
                                </>
                            ) : isGameOpen ? (
                                <>
                                    {isPlayerPropsMarket && playerPropsMarkets ? (
                                        <>
                                            <PositionsV2
                                                markets={[
                                                    marketTypeFilterMarket
                                                        ? marketTypeFilterMarket
                                                        : playerPropsMarkets[0],
                                                ]}
                                                marketType={
                                                    marketTypeFilter && marketTypeFilterMarket
                                                        ? marketTypeFilter
                                                        : market.typeId
                                                }
                                                isGameOpen={isGameOpen}
                                                isMainPageView
                                                isColumnView={isColumnView}
                                                hidePlayerName
                                                oddsTitlesHidden={oddsTitlesHidden}
                                                floatingOddsTitles={floatingOddsTitles}
                                            />
                                            {isColumnView && !isMobile && playerPropsMarkets[1] && (
                                                <PositionsV2
                                                    markets={[playerPropsMarkets[1]]}
                                                    marketType={market.typeId}
                                                    isGameOpen={isGameOpen}
                                                    isMainPageView
                                                    isColumnView={isColumnView}
                                                    hidePlayerName
                                                    oddsTitlesHidden={oddsTitlesHidden}
                                                    floatingOddsTitles={floatingOddsTitles}
                                                />
                                            )}
                                            {isColumnView && !isMobile && playerPropsMarkets[2] && (
                                                <PositionsV2
                                                    markets={[playerPropsMarkets[2]]}
                                                    marketType={market.typeId}
                                                    isGameOpen={isGameOpen}
                                                    isMainPageView
                                                    isColumnView={isColumnView}
                                                    hidePlayerName
                                                    oddsTitlesHidden={oddsTitlesHidden}
                                                    floatingOddsTitles={floatingOddsTitles}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <PositionsV2
                                                markets={[marketTypeFilterMarket ? marketTypeFilterMarket : market]}
                                                marketType={
                                                    marketTypeFilter && marketTypeFilterMarket
                                                        ? marketTypeFilter
                                                        : market.typeId
                                                }
                                                isGameOpen={isGameOpen}
                                                isMainPageView
                                                isColumnView={isColumnView}
                                                width={isColumnView ? '20%' : undefined}
                                            />
                                            {isColumnView && !isMobile && spreadMarket && (
                                                <PositionsV2
                                                    markets={[spreadMarket]}
                                                    marketType={
                                                        market.leagueId === League.US_ELECTION
                                                            ? MarketType.US_ELECTION_POPULAR_VOTE_WINNER
                                                            : MarketType.SPREAD
                                                    }
                                                    isGameOpen={isGameOpen}
                                                    isMainPageView
                                                    isColumnView={isColumnView}
                                                    width="20%"
                                                />
                                            )}
                                            {isColumnView && !isMobile && totalMarket && (
                                                <PositionsV2
                                                    markets={[totalMarket]}
                                                    marketType={
                                                        market.leagueId === League.US_ELECTION
                                                            ? MarketType.US_ELECTION_WINNING_PARTY
                                                            : MarketType.TOTAL
                                                    }
                                                    isGameOpen={isGameOpen}
                                                    isMainPageView
                                                    isColumnView={isColumnView}
                                                    width="20%"
                                                />
                                            )}
                                        </>
                                    )}
                                    <MarketsCountWrapper
                                        hidden={marketsCount === 0}
                                        isPlayerPropsMarket={isPlayerPropsMarket}
                                        onClick={() => {
                                            if (isPlayerPropsMarket) {
                                                dispatch(
                                                    setSelectedMarket({
                                                        gameId: market.gameId,
                                                        sport: market.sport,
                                                        live: market.live,
                                                        playerName: market.playerProps.playerName,
                                                    })
                                                );
                                            } else {
                                                dispatch(
                                                    setSelectedMarket({
                                                        gameId: market.gameId,
                                                        sport: market.sport,
                                                        live: market.live,
                                                    })
                                                );
                                            }
                                        }}
                                    >
                                        {`+${marketsCount}`}
                                        {!isMobile && <Arrow className={'icon icon--arrow-down'} />}
                                    </MarketsCountWrapper>
                                </>
                            ) : (
                                <MatchStatus market={market} />
                            )}
                        </>
                    )}
                </MainContainer>
                {!isPlayerPropsMarket && overdropGameMultiplier && (
                    <GameOfLabel
                        isLive={isGameLive}
                        selected={selected}
                        isLeagueInfoVisible={showLeagueInfo}
                    >{`Game of the ${overdropGameMultiplier.type}`}</GameOfLabel>
                )}
                {!selectedMarket?.gameId && !isPlayerPropsMarket && !!overdropGameMultiplier && (
                    <FireContainer gap={2}>
                        <Fire className={'icon icon--fire'} />
                        <FireText>{`+${overdropGameMultiplier.multiplier}% XP`}</FireText>
                    </FireContainer>
                )}
                {!selectedMarket?.gameId && !isMobile && (
                    <SPAAnchor
                        href={buildMarketLink(
                            market.gameId,
                            language,
                            false,
                            encodeURIComponent(`${market.homeTeam} - ${market.awayTeam}`)
                        )}
                    >
                        <Tooltip overlay="Open market page">
                            <ExternalArrow className={'icon icon--arrow-external'} />
                        </Tooltip>
                    </SPAAnchor>
                )}
            </>
        );

        return (
            <Wrapper
                hideGame={hideGame}
                isResolved={isGameRegularlyResolved}
                selected={selected}
                isMarketSelected={isMarketSelected}
                isOverdrop={!isPlayerPropsMarket && !!overdropGameMultiplier}
                floatingOddsTitles={floatingOddsTitles}
            >
                {isGameOpen || isGameLive ? (
                    <>{getMainContainerContent()}</>
                ) : (
                    <SPAAnchor
                        href={buildMarketLink(
                            market.gameId,
                            language,
                            false,
                            encodeURIComponent(`${market.homeTeam} - ${market.awayTeam}`)
                        )}
                    >
                        {getMainContainerContent()}
                    </SPAAnchor>
                )}
            </Wrapper>
        );
    },
    (prevProps: MarketRowCardProps, newProps: MarketRowCardProps) => {
        return isEqual(prevProps, newProps);
    }
);

export default MarketListCard;
