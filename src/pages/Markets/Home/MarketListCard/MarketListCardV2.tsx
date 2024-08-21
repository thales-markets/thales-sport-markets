import liveAnimationData from 'assets/lotties/live-markets-filter.json';
import SPAAnchor from 'components/SPAAnchor';
import TimeRemaining from 'components/TimeRemaining';
import Tooltip from 'components/Tooltip';
import { MarketType } from 'enums/marketTypes';
import { League, Sport } from 'enums/sports';
import Lottie from 'lottie-react';
import useGameMultipliersQuery from 'queries/overdrop/useGameMultipliersQuery';
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
import { SportMarket } from 'types/markets';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { isOddValid } from 'utils/marketsV2';
import { buildMarketLink } from 'utils/routes';
import { getLeaguePeriodType, getLeagueTooltipKey } from 'utils/sports';
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
    Fire,
    FireContainer,
    FireText,
    GameOfLabel,
    LiveIndicatorContainer,
    MainContainer,
    MarketsCountWrapper,
    MatchInfo,
    MatchInfoContainer,
    MatchInfoLabel,
    OverdropGradientBorder,
    PeriodResultContainer,
    ResultLabel,
    SecondaryResultsWrapper,
    TeamLogosContainer,
    TeamNameLabel,
    TeamNamesContainer,
    TeamsInfoContainer,
    Wrapper,
    liveBlinkStyle,
    liveBlinkStyleMobile,
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

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.leagueId));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.leagueId));
    }, [market.homeTeam, market.awayTeam, market.leagueId]);

    const isGameStarted = market.maturityDate < new Date();
    const isGameOpen = market.isOpen && !isGameStarted;
    const isGameRegularlyResolved = market.isResolved && !market.isCancelled;
    const isGameLive = !!market.live;

    const spreadMarket = useMemo(() => {
        const spreadMarkets = market.childMarkets.filter((childMarket) =>
            childMarket.leagueId === League.US_ELECTION
                ? childMarket.typeId === MarketType.US_ELECTION_POPULAR_VOTE_WINNER
                : childMarket.typeId === MarketType.SPREAD
        );

        return spreadMarkets.length > 0
            ? spreadMarkets.reduce(function (prev, curr) {
                  return Math.abs(curr.odds[0] - MEDIUM_ODDS) < Math.abs(prev.odds[0] - MEDIUM_ODDS) ? curr : prev;
              })
            : undefined;
    }, [market.childMarkets]);

    const totalMarket = useMemo(() => {
        const totalMarkets = market.childMarkets.filter((childMarket) =>
            childMarket.leagueId === League.US_ELECTION
                ? childMarket.typeId === MarketType.US_ELECTION_WINNING_PARTY
                : childMarket.typeId === MarketType.TOTAL
        );

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

    const areChildMarketsOddsValid = market.childMarkets.some((childMarket) =>
        childMarket.odds.some((odd) => isOddValid(odd))
    );

    const areOddsValid = market.odds.some((odd) => isOddValid(odd));

    const hideGame = isGameLive ? false : isGameOpen && !areOddsValid && !areChildMarketsOddsValid;
    const isColumnView =
        !isGameLive && marketTypeFilter === undefined && isThreeWayView && !isMarketSelected && isGameOpen && !isMobile;
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

    const gameMultipliersQuery = useGameMultipliersQuery({
        enabled: isAppReady,
    });

    const overdropGameMultiplier = useMemo(() => {
        const gameMultipliers =
            gameMultipliersQuery.isSuccess && gameMultipliersQuery.data ? gameMultipliersQuery.data : [];
        return gameMultipliers.find((multiplier) => multiplier.gameId === market.gameId);
    }, [gameMultipliersQuery.data, gameMultipliersQuery.isSuccess, market.gameId]);

    const getMainContainerContent = () => (
        <>
            <MainContainer isGameOpen={isGameOpen || isGameLive}>
                <MatchInfoContainer
                    isGameLive={isGameLive}
                    onClick={() => {
                        if (isGameOpen && !isGameLive) {
                            dispatch(setSelectedMarket({ gameId: market.gameId, sport: market.sport }));
                        }
                    }}
                >
                    {overdropGameMultiplier && (
                        <GameOfLabel>{`Game of the ${overdropGameMultiplier.type}`}</GameOfLabel>
                    )}
                    <MatchInfo selected={selected}>
                        {isGameLive ? (
                            <>
                                <LiveIndicatorContainer>
                                    <Lottie
                                        autoplay={true}
                                        animationData={liveAnimationData}
                                        loop={true}
                                        style={isMobile ? liveBlinkStyleMobile : liveBlinkStyle}
                                    />
                                    <MatchInfoLabel>{t(`markets.market-card.live`)}</MatchInfoLabel>
                                </LiveIndicatorContainer>
                                <MatchInfoLabel>
                                    {displayGameClock(market) ? market.gameClock : ''}
                                    {(market.gamePeriod != null &&
                                        market.gamePeriod != undefined &&
                                        getLeaguePeriodType(Number(market.leagueId)) == 'half') ||
                                    getLeaguePeriodType(Number(market.leagueId)) == 'quarter' ? (
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
                        <MatchInfoLabel>
                            {!isColumnView && !isMarketSelected && !isMobile && (
                                <>{`${market.tournamentName ? ` | ${market.tournamentName}` : ''}${
                                    market.tournamentRound ? ` | ${market.tournamentRound}` : ''
                                }`}</>
                            )}
                            {leagueTooltipKey && (
                                <Tooltip overlay={t(leagueTooltipKey)} iconFontSize={12} marginLeft={2} />
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
                                {market.isOneSideMarket
                                    ? fixOneSideMarketCompetitorName(market.homeTeam)
                                    : market.homeTeam}
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
                            <>
                                <CurrentResultContainer isColumnView={isColumnView}>
                                    <ResultLabel isColumnView={isColumnView} isMarketSelected={isMarketSelected}>
                                        {market.homeScore}
                                    </ResultLabel>
                                    {isMobile && (isGameOpen || isGameLive) && (
                                        <ResultLabel isColumnView={isColumnView} isMarketSelected={isMarketSelected}>
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
                                            <PeriodResultContainer key={index} isColumnView={isColumnView}>
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
                        {isGameLive ? (
                            <PositionsV2
                                markets={[market]}
                                marketType={MarketType.WINNER}
                                isGameOpen={isGameLive}
                                isGameLive={isGameLive}
                                isMainPageView
                                isColumnView={isColumnView}
                            />
                        ) : isGameOpen ? (
                            <>
                                <PositionsV2
                                    markets={[marketTypeFilterMarket ? marketTypeFilterMarket : market]}
                                    marketType={
                                        marketTypeFilter && marketTypeFilterMarket
                                            ? marketTypeFilter
                                            : MarketType.WINNER
                                    }
                                    isGameOpen={isGameOpen}
                                    isMainPageView
                                    isColumnView={isColumnView}
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
                                    />
                                )}
                                {marketsCount > 0 && (
                                    <MarketsCountWrapper
                                        onClick={() =>
                                            dispatch(setSelectedMarket({ gameId: market.gameId, sport: market.sport }))
                                        }
                                    >
                                        {!!overdropGameMultiplier && (
                                            <FireContainer gap={2}>
                                                <Fire className={'icon icon--fire'} />
                                                <FireText>{`+${overdropGameMultiplier.multiplier}% XP`}</FireText>
                                            </FireContainer>
                                        )}

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
                            <MatchStatus market={market} />
                        )}
                    </>
                )}
            </MainContainer>
        </>
    );

    return (
        <OverdropGradientBorder isOverdrop={!!overdropGameMultiplier}>
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
        </OverdropGradientBorder>
    );
};

export default MarketListCard;
