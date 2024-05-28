import liveAnimationData from 'assets/lotties/live-markets-filter.json';
import SPAAnchor from 'components/SPAAnchor';
import TimeRemaining from 'components/TimeRemaining';
import Tooltip from 'components/Tooltip';
import { MarketType } from 'enums/marketTypes';
import { League, Provider, Sport } from 'enums/sports';
import Lottie from 'lottie-react';
import useEnetpulseAdditionalDataQuery from 'queries/markets/useEnetpulseAdditionalDataQuery';
import useJsonOddsAdditionalDataQuery from 'queries/markets/useJsonOddsAdditionalDataQuery';
import useSportMarketLiveResultQuery from 'queries/markets/useSportMarketLiveResultQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import {
    getIsMarketSelected,
    getIsThreeWayView,
    getMarketTypeFilter,
    getSelectedMarket,
    setSelectedMarket,
} from 'redux/modules/market';
import { formatShortDateWithTime } from 'thales-utils';
import { SportMarket, SportMarketLiveResult } from 'types/markets';
import { convertFromBytes32, fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { isOddValid } from 'utils/marketsV2';
import { buildMarketLink } from 'utils/routes';
import { getLeaguePeriodType, getLeagueProvider, getLeagueSport, getLeagueTooltipKey } from 'utils/sports';
import { displayGameClock, displayGamePeriod } from 'utils/ui';
import { MEDIUM_ODDS } from '../../../../constants/markets';
import PositionsV2 from '../../Market/MarketDetailsV2/components/PositionsV2';
import MatchStatus from './components/MatchStatus';
import {
    Arrow,
    Blink,
    ClubLogo,
    CurrentResultContainer,
    ExternalArrow,
    LiveIndicatorContainer,
    MainContainer,
    MarketsCountWrapper,
    MatchInfo,
    MatchInfoContainer,
    MatchInfoLabel,
    Result,
    ResultContainer,
    ResultLabel,
    ResultWrapper,
    TeamLogosContainer,
    TeamNameLabel,
    TeamNamesContainer,
    TeamsInfoContainer,
    Wrapper,
    liveBlinkStyle,
} from './styled-components';

type MarketRowCardProps = {
    market: SportMarket;
    language: string;
};

const MarketListCard: React.FC<MarketRowCardProps> = ({ market, language }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isAppReady = useSelector(getIsAppReady);
    const isMarketSelected = useSelector(getIsMarketSelected);
    const isThreeWayView = useSelector(getIsThreeWayView);
    const selectedMarket = useSelector(getSelectedMarket);
    const marketTypeFilter = useSelector(getMarketTypeFilter);
    const isMobile = useSelector(getIsMobile);
    // const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.leagueId));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.leagueId));

    const [liveResultInfo, setLiveResultInfo] = useState<SportMarketLiveResult | undefined>(undefined);

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.leagueId));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.leagueId));
    }, [market.homeTeam, market.awayTeam, market.leagueId]);

    const isGameStarted = market.maturityDate < new Date();
    const isGameOpen = market.isOpen && !isGameStarted;
    const isGameResolved = market.isResolved || market.isCancelled;
    const isGameRegularlyResolved = market.isResolved && !market.isCancelled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const isGameLive = !!market.live;

    const isEnetpulseSport = getLeagueProvider(Number(market.leagueId)) === Provider.ENETPULSE;
    const isJsonOddsSport = getLeagueProvider(Number(market.leagueId)) === Provider.JSONODDS;
    const gameIdString = convertFromBytes32(market.gameId);
    const gameDate = new Date(market.maturityDate).toISOString().split('T')[0];

    const spreadMarket = useMemo(() => {
        const spreadMarkets = market.childMarkets.filter((childMarket) => childMarket.typeId === MarketType.SPREAD);

        return spreadMarkets.length > 0
            ? spreadMarkets.reduce(function (prev, curr) {
                  return Math.abs(curr.odds[0] - MEDIUM_ODDS) < Math.abs(prev.odds[0] - MEDIUM_ODDS) ? curr : prev;
              })
            : undefined;
    }, [market.childMarkets]);

    const totalMarket = useMemo(() => {
        const totalMarkets = market.childMarkets.filter((childMarket) => childMarket.typeId === MarketType.TOTAL);

        return totalMarkets.length > 0
            ? totalMarkets.reduce(function (prev, curr) {
                  return Math.abs(curr.odds[0] - MEDIUM_ODDS) < Math.abs(prev.odds[0] - MEDIUM_ODDS) ? curr : prev;
              })
            : undefined;
    }, [market.childMarkets]);

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

    const useLiveResultQuery = useSportMarketLiveResultQuery(gameIdString, {
        enabled: isAppReady && isPendingResolution && !isEnetpulseSport && !isJsonOddsSport,
    });

    const useEnetpulseLiveResultQuery = useEnetpulseAdditionalDataQuery(gameIdString, gameDate, market.leagueId, {
        enabled: isAppReady && isEnetpulseSport && (isPendingResolution || !localStorage.getItem(market.gameId)),
    });

    const useJsonDataAdditionalInfoQuery = useJsonOddsAdditionalDataQuery(gameIdString, market.leagueId, {
        enabled: isAppReady && isJsonOddsSport && (isPendingResolution || !localStorage.getItem(market.gameId)),
    });

    useEffect(() => {
        if (isEnetpulseSport) {
            if (useEnetpulseLiveResultQuery.isSuccess && useEnetpulseLiveResultQuery.data) {
                setLiveResultInfo(useEnetpulseLiveResultQuery.data);
                const tournamentName = useEnetpulseLiveResultQuery.data.tournamentName
                    ? market.isOneSideMarket
                        ? useEnetpulseLiveResultQuery.data.tournamentName
                        : ' | ' + useEnetpulseLiveResultQuery.data.tournamentName
                    : '';
                const tournamentRound = useEnetpulseLiveResultQuery.data.tournamentRound
                    ? ' | ' + useEnetpulseLiveResultQuery.data.tournamentRound
                    : '';
                localStorage.setItem(market.gameId, tournamentName + tournamentRound);
            }
        } else if (isJsonOddsSport) {
            if (useJsonDataAdditionalInfoQuery.isSuccess && useJsonDataAdditionalInfoQuery.data) {
                const tournamentName = useJsonDataAdditionalInfoQuery.data;
                localStorage.setItem(market.gameId, tournamentName);
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
        market.isOneSideMarket,
        market.gameId,
        useJsonDataAdditionalInfoQuery,
        useJsonDataAdditionalInfoQuery.data,
        isJsonOddsSport,
    ]);

    const areChildMarketsOddsValid = market.childMarkets.some((childMarket) =>
        childMarket.odds.some((odd) => isOddValid(odd))
    );

    const areOddsValid = market.odds.some((odd) => isOddValid(odd));

    const hideGame = isGameLive ? !areOddsValid : isGameOpen && !areOddsValid && !areChildMarketsOddsValid;
    const isColumnView =
        marketTypeFilter === undefined && isThreeWayView && !isMarketSelected && isGameOpen && !isMobile;
    const isTwoPositionalMarket = market.odds.length === 2;
    const selected = selectedMarket?.gameId == market.gameId;

    let marketsCount = market.childMarkets.length;
    if (isColumnView) {
        if (spreadMarket) {
            marketsCount -= 1;
        }
        if (totalMarket) {
            marketsCount -= 1;
        }
    }

    const leagueTooltipKey = getLeagueTooltipKey(market.leagueId);

    const getMainContainerContent = () => (
        <MainContainer isGameOpen={isGameOpen || isGameLive}>
            <MatchInfoContainer
                isGameLive={isGameLive}
                onClick={() => {
                    if (isGameOpen && !isGameLive) {
                        dispatch(setSelectedMarket({ gameId: market.gameId, sport: market.sport }));
                    }
                }}
            >
                <MatchInfo selected={selected}>
                    {isGameLive ? (
                        <>
                            <LiveIndicatorContainer>
                                <Lottie
                                    autoplay={true}
                                    animationData={liveAnimationData}
                                    loop={true}
                                    style={liveBlinkStyle}
                                />
                                <MatchInfoLabel>{t(`markets.market-card.live`)}</MatchInfoLabel>
                            </LiveIndicatorContainer>
                            <MatchInfoLabel>
                                {displayGameClock(market) ? market.gameClock : ''}
                                {displayGameClock(market) && getLeaguePeriodType(Number(market.leagueId)) == 'half' ? (
                                    <Blink>&prime;</Blink>
                                ) : (
                                    ''
                                )}
                                {displayGamePeriod(market)}
                            </MatchInfoLabel>
                        </>
                    ) : (
                        <Tooltip
                            overlay={
                                <>
                                    {t(`markets.market-card.starts-in`)}:{' '}
                                    <TimeRemaining end={market.maturityDate} fontSize={11} />
                                </>
                            }
                            component={
                                <MatchInfoLabel>
                                    {formatShortDateWithTime(new Date(market.maturityDate))}{' '}
                                </MatchInfoLabel>
                            }
                        />
                    )}
                    {leagueTooltipKey && <Tooltip overlay={t(leagueTooltipKey)} iconFontSize={12} marginLeft={2} />}
                    <MatchInfoLabel>
                        {(isEnetpulseSport || isJsonOddsSport) &&
                        (liveResultInfo || localStorage.getItem(market.gameId)) &&
                        !isColumnView &&
                        !isMarketSelected &&
                        !isMobile ? (
                            <>
                                {localStorage.getItem(market.gameId)}
                                {getLeagueSport(market.leagueId) === Sport.TENNIS && (
                                    <Tooltip overlay={t(`common.tennis-tooltip`)} iconFontSize={12} marginLeft={2} />
                                )}
                            </>
                        ) : (
                            ''
                        )}
                    </MatchInfoLabel>
                </MatchInfo>
                <TeamsInfoContainer>
                    <TeamLogosContainer isColumnView={isColumnView} isTwoPositionalMarket={isTwoPositionalMarket}>
                        <ClubLogo
                            alt="Home team logo"
                            src={homeLogoSrc}
                            onError={getOnImageError(setHomeLogoSrc, market.leagueId)}
                            isColumnView={isColumnView}
                        />
                        {!market.isOneSideMarket && (
                            <>
                                <ClubLogo
                                    alt="Away team logo"
                                    src={awayLogoSrc}
                                    onError={getOnImageError(setAwayLogoSrc, market.leagueId)}
                                    awayTeam={true}
                                    isColumnView={isColumnView}
                                />
                            </>
                        )}
                    </TeamLogosContainer>
                    <TeamNamesContainer
                        isColumnView={isColumnView}
                        isTwoPositionalMarket={isTwoPositionalMarket}
                        isGameOpen={isGameOpen || isGameLive}
                    >
                        <TeamNameLabel isColumnView={isColumnView} isMarketSelected={isMarketSelected}>
                            {market.isOneSideMarket ? fixOneSideMarketCompetitorName(market.homeTeam) : market.homeTeam}
                        </TeamNameLabel>
                        {!market.isOneSideMarket && (
                            <>
                                {isMobile && (isGameOpen || isGameLive) && (
                                    <TeamNameLabel isColumnView={isColumnView} isMarketSelected={isMarketSelected}>
                                        {' '}
                                        -{' '}
                                    </TeamNameLabel>
                                )}
                                <TeamNameLabel isColumnView={isColumnView} isMarketSelected={isMarketSelected}>
                                    {market.awayTeam}
                                </TeamNameLabel>
                            </>
                        )}
                    </TeamNamesContainer>
                    {isGameLive && (
                        <CurrentResultContainer isColumnView={isColumnView}>
                            <TeamNameLabel isColumnView={isColumnView} isMarketSelected={isMarketSelected}>
                                {market.homeScore}
                            </TeamNameLabel>
                            {isMobile && (isGameOpen || isGameLive) && (
                                <TeamNameLabel isColumnView={isColumnView} isMarketSelected={isMarketSelected}>
                                    {' '}
                                    -{' '}
                                </TeamNameLabel>
                            )}
                            <TeamNameLabel isColumnView={isColumnView} isMarketSelected={isMarketSelected}>
                                {market.awayScore}
                            </TeamNameLabel>
                        </CurrentResultContainer>
                    )}
                </TeamsInfoContainer>
            </MatchInfoContainer>
            {!isMarketSelected && (
                <>
                    {isGameLive ? (
                        <PositionsV2
                            markets={[market]}
                            marketType={MarketType.WINNER}
                            isGameOpen={isGameLive}
                            isMainPageView
                            isColumnView={isColumnView}
                        />
                    ) : isGameOpen ? (
                        <>
                            <PositionsV2
                                markets={[marketTypeFilterMarket ? marketTypeFilterMarket : market]}
                                marketType={
                                    marketTypeFilter && marketTypeFilterMarket ? marketTypeFilter : MarketType.WINNER
                                }
                                isGameOpen={isGameOpen}
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
                            {marketsCount > 0 && (
                                <MarketsCountWrapper
                                    onClick={() =>
                                        dispatch(setSelectedMarket({ gameId: market.gameId, sport: market.sport }))
                                    }
                                >
                                    {`+${marketsCount}`}
                                    {!isMobile && <Arrow className={'icon icon--arrow-down'} />}
                                </MarketsCountWrapper>
                            )}

                            {!isMobile && (
                                <SPAAnchor
                                    href={buildMarketLink(
                                        market.gameId,
                                        language,
                                        false,
                                        encodeURIComponent(`${market.homeTeam} vs ${market.awayTeam}`)
                                    )}
                                >
                                    <Tooltip
                                        overlay="Open market page"
                                        component={<ExternalArrow className={'icon icon--arrow-external'} />}
                                    />
                                </SPAAnchor>
                            )}
                        </>
                    ) : (
                        <>
                            {isGameRegularlyResolved ? (
                                <ResultWrapper>
                                    <ResultLabel>
                                        {!market.isOneSideMarket ? `${t('markets.market-card.result')}:` : ''}
                                    </ResultLabel>
                                    <ResultContainer>
                                        <Result>
                                            {market.isOneSideMarket
                                                ? market.homeScore == 1
                                                    ? t('markets.market-card.race-winner')
                                                    : t('markets.market-card.no-win')
                                                : Number(market.leagueId) != League.UFC
                                                ? `${market.homeScore} - ${market.awayScore}`
                                                : ''}
                                            {Number(market.leagueId) == League.UFC ? (
                                                <>
                                                    {Number(market.homeScore) > 0
                                                        ? `W - L (R${market.homeScore})`
                                                        : `L - W (R${market.awayScore})`}
                                                </>
                                            ) : (
                                                ''
                                            )}
                                        </Result>
                                        {getLeagueSport(market.leagueId) === Sport.SOCCER && (
                                            <Result>
                                                {market.homeScoreByPeriod.length > 0 &&
                                                    market.awayScoreByPeriod.length > 0 &&
                                                    ' (' +
                                                        market.homeScoreByPeriod[0] +
                                                        ' - ' +
                                                        market.awayScoreByPeriod[0] +
                                                        ')'}
                                            </Result>
                                        )}
                                    </ResultContainer>
                                </ResultWrapper>
                            ) : (
                                <MatchStatus
                                    isPendingResolution={isPendingResolution}
                                    liveResultInfo={liveResultInfo}
                                    isCancelled={market.isCancelled}
                                    isPaused={market.isPaused}
                                    isEnetpulseSport={isEnetpulseSport}
                                    isJsonOddsSport={isJsonOddsSport}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </MainContainer>
    );

    return (
        <Wrapper
            hideGame={hideGame}
            isResolved={isGameRegularlyResolved}
            selected={selected}
            isMarketSelected={isMarketSelected}
        >
            {isGameOpen || isGameLive ? (
                <>{getMainContainerContent()}</>
            ) : (
                <SPAAnchor
                    href={buildMarketLink(
                        market.gameId,
                        language,
                        false,
                        encodeURIComponent(`${market.homeTeam} vs ${market.awayTeam}`)
                    )}
                >
                    {getMainContainerContent()}
                </SPAAnchor>
            )}
        </Wrapper>
    );
};

export default MarketListCard;
