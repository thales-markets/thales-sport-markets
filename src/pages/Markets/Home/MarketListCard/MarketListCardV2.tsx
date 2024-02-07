import SPAAnchor from 'components/SPAAnchor';
import TimeRemaining from 'components/TimeRemaining';
import Tooltip from 'components/Tooltip';
import { ENETPULSE_SPORTS, FIFA_WC_TAG, FIFA_WC_U20_TAG, JSON_ODDS_SPORTS, SPORTS_TAGS_MAP } from 'constants/tags';
import useEnetpulseAdditionalDataQuery from 'queries/markets/useEnetpulseAdditionalDataQuery';
import useJsonOddsAdditionalDataQuery from 'queries/markets/useJsonOddsAdditionalDataQuery';
import useSportMarketLiveResultQuery from 'queries/markets/useSportMarketLiveResultQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { formatShortDateWithTime } from 'thales-utils';
import { SportMarketInfoV2, SportMarketLiveResult } from 'types/markets';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { isFifaWCGame, isGolf, isIIHFWCGame, isMotosport, isUEFAGame } from 'utils/markets';
import { buildMarketLink } from 'utils/routes';
import Web3 from 'web3';
import MatchStatus from './components/MatchStatus';
import OddsV2 from './components/OddsV2';
import {
    ClubLogo,
    MainContainer,
    MatchInfoConatiner,
    MatchTimeLabel,
    OddsWrapper,
    Result,
    ResultLabel,
    ResultWrapper,
    TeamLogosConatiner,
    TeamNameLabel,
    TeamNamesConatiner,
    TeamsInfoConatiner,
    VSLabel,
    Wrapper,
} from './styled-components';

// 3 for double chance, 1 for spread, 1 for total
const MAX_NUMBER_OF_CHILD_MARKETS_ON_CONTRACT = 5;
// 1 for winner, 1 for double chance, 1 for spread, 1 for total
// const MAX_NUMBER_OF_MARKETS = 4;

type MarketRowCardProps = {
    market: SportMarketInfoV2;
    language: string;
};

const MarketListCard: React.FC<MarketRowCardProps> = ({ market, language }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    // const isMobile = useSelector((state: RootState) => getIsMobile(state));
    // const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.leagueId));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.leagueId));

    const [liveResultInfo, setLiveResultInfo] = useState<SportMarketLiveResult | undefined>(undefined);

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.leagueId));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.leagueId));
    }, [market.homeTeam, market.awayTeam, market.leagueId]);

    const isGameStarted = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const isGameRegularlyResolved = market.isResolved && !market.isCanceled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const showOdds = !isPendingResolution && !isGameResolved && !market.isPaused;
    const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(market.leagueId));
    const isJsonOddsSport = JSON_ODDS_SPORTS.includes(Number(market.leagueId));
    const gameIdString = Web3.utils.hexToAscii(market.gameId);
    const gameDate = new Date(market.maturityDate).toISOString().split('T')[0];

    // const doubleChanceMarkets = market.childMarkets.filter((market) => market.betType === BetType.DOUBLE_CHANCE);
    // const spreadTotalMarkets = market.childMarkets.filter(
    //     (market) => market.betType === BetType.SPREAD || market.betType === BetType.TOTAL
    // );
    // const playerPropsMarkets = market.childMarkets.filter((market) => isPlayerProps(market.betType));

    // const hasChildMarkets =
    //     doubleChanceMarkets.length > 0 || spreadTotalMarkets.length > 0 || playerPropsMarkets.length > 0;
    // const hasCombinedMarkets = market.combinedMarketsData ? true : false;
    // const hasPlayerPropsMarkets = playerPropsMarkets.length > 0;
    // const MAX_NUMBER_OF_MARKETS_COUNT =
    //     doubleChanceMarkets.length + playerPropsMarkets.length + combinedMarketPositions.length;
    // const isMaxNumberOfChildMarkets =
    //     market.childMarkets.length === MAX_NUMBER_OF_CHILD_MARKETS_ON_CONTRACT ||
    //     market.childMarkets.length + combinedMarketPositions.length >= MAX_NUMBER_OF_CHILD_MARKETS_ON_CONTRACT;
    // const showSecondRowOnDesktop = !isMobile && (isMaxNumberOfChildMarkets || hasPlayerPropsMarkets);
    // const showSecondRowOnMobile = isMobile && hasChildMarkets;

    // const showOnlyCombinedPositionsInSecondRow =
    //     showSecondRowOnDesktop && !isMobile && !doubleChanceMarkets.length && combinedMarketPositions.length > 0;

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
                        : '| ' + useEnetpulseLiveResultQuery.data.tournamentName
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

    // const areDoubleChanceMarketsOddsValid =
    //     doubleChanceMarkets && doubleChanceMarkets.length > 0
    //         ? doubleChanceMarkets.map((item) => item.homeOdds).every((odd) => odd < 1 && odd != 0)
    //         : false;

    // const areSpreadTotalsMarketsOddsValid =
    //     spreadTotalMarkets && spreadTotalMarkets.length > 0
    //         ? spreadTotalMarkets
    //               .map((item) => [item.homeOdds, item.awayOdds])
    //               .every((oddsArray) => oddsArray[0] < 1 && oddsArray[0] != 0 && oddsArray[1] < 1 && oddsArray[1] != 0)
    //         : false;

    const areOddsValid = market.odds.every((odd) => odd < 1 && odd != 0);

    const hideGame =
        // !areDoubleChanceMarketsOddsValid &&
        // !areSpreadTotalsMarketsOddsValid &&
        !areOddsValid && !isMotosport(Number(market.leagueId)) && !isGolf(Number(market.leagueId)) && showOdds;

    return (
        <Wrapper hideGame={hideGame} isResolved={isGameRegularlyResolved}>
            <MainContainer>
                <MatchInfoConatiner>
                    <SPAAnchor
                        href={buildMarketLink(
                            market.gameId,
                            language,
                            false,
                            encodeURIComponent(`${market.homeTeam} vs ${market.awayTeam}`)
                        )}
                    >
                        <Tooltip
                            overlay={
                                <>
                                    {t(`markets.market-card.starts-in`)}:{' '}
                                    <TimeRemaining end={market.maturityDate} fontSize={11} />
                                </>
                            }
                            component={<MatchTimeLabel>{formatShortDateWithTime(market.maturityDate)} </MatchTimeLabel>}
                        />
                        {isFifaWCGame(market.leagueId) && (
                            <Tooltip overlay={t(`common.fifa-tooltip`)} iconFontSize={12} marginLeft={2} />
                        )}
                        {isIIHFWCGame(market.leagueId) && (
                            <Tooltip overlay={t(`common.iihf-tooltip`)} iconFontSize={12} marginLeft={2} />
                        )}
                        {isUEFAGame(Number(market.leagueId)) && (
                            <Tooltip overlay={t(`common.football-tooltip`)} iconFontSize={12} marginLeft={2} />
                        )}
                        <MatchTimeLabel>
                            {(isEnetpulseSport || isJsonOddsSport) &&
                            !isFifaWCGame(market.leagueId) &&
                            !isUEFAGame(Number(market.leagueId)) &&
                            (liveResultInfo || localStorage.getItem(market.gameId)) ? (
                                <>
                                    {localStorage.getItem(market.gameId)}
                                    {SPORTS_TAGS_MAP['Tennis'].includes(Number(market.leagueId)) && (
                                        <Tooltip
                                            overlay={t(`common.tennis-tooltip`)}
                                            iconFontSize={12}
                                            marginLeft={2}
                                        />
                                    )}
                                </>
                            ) : (
                                ''
                            )}
                        </MatchTimeLabel>
                        <TeamsInfoConatiner>
                            <TeamLogosConatiner>
                                <ClubLogo
                                    height={
                                        market.leagueId == FIFA_WC_TAG || market.leagueId == FIFA_WC_U20_TAG
                                            ? '17px'
                                            : ''
                                    }
                                    width={
                                        market.leagueId == FIFA_WC_TAG || market.leagueId == FIFA_WC_U20_TAG
                                            ? '27px'
                                            : ''
                                    }
                                    alt="Home team logo"
                                    src={homeLogoSrc}
                                    onError={getOnImageError(setHomeLogoSrc, market.leagueId)}
                                />
                                {!market.isOneSideMarket && (
                                    <>
                                        <VSLabel>VS</VSLabel>
                                        <ClubLogo
                                            height={
                                                market.leagueId == FIFA_WC_TAG || market.leagueId == FIFA_WC_U20_TAG
                                                    ? '17px'
                                                    : ''
                                            }
                                            width={
                                                market.leagueId == FIFA_WC_TAG || market.leagueId == FIFA_WC_U20_TAG
                                                    ? '27px'
                                                    : ''
                                            }
                                            alt="Away team logo"
                                            src={awayLogoSrc}
                                            onError={getOnImageError(setAwayLogoSrc, market.leagueId)}
                                        />
                                    </>
                                )}
                            </TeamLogosConatiner>
                            <TeamNamesConatiner>
                                <TeamNameLabel>
                                    {market.isOneSideMarket
                                        ? fixOneSideMarketCompetitorName(market.homeTeam)
                                        : market.homeTeam}
                                </TeamNameLabel>
                                {!market.isOneSideMarket && <TeamNameLabel>{market.awayTeam}</TeamNameLabel>}
                            </TeamNamesConatiner>
                        </TeamsInfoConatiner>
                    </SPAAnchor>
                </MatchInfoConatiner>
                <OddsWrapper>
                    {showOdds && (
                        <>
                            <OddsV2 market={market} />
                            {/* {!isMobile && (
                                <>
                                    {doubleChanceMarkets.length > 0 && (
                                        <OddsV2
                                            market={doubleChanceMarkets[0]}
                                            doubleChanceMarkets={doubleChanceMarkets}
                                        />
                                    )}
                                    {!showSecondRowOnDesktop &&
                                        spreadTotalMarkets.map((childMarket) => (
                                            <OddsV2 market={childMarket} key={childMarket.address} />
                                        ))}
                                    {showOnlyCombinedPositionsInSecondRow &&
                                        spreadTotalMarkets.map((childMarket) => (
                                            <OddsV2 market={childMarket} key={childMarket.address} />
                                        ))}
                                </>
                            )}
                            {showSecondRowOnMobile && (
                                <Arrow
                                    className={isExpanded ? 'icon icon--arrow-up' : 'icon icon--arrow-down'}
                                    onClick={() => setIsExpanded(!isExpanded)}
                                />
                            )}
                            {showSecondRowOnDesktop && (
                                <TotalMarketsWrapper>
                                    {hasPlayerPropsMarkets && (
                                        <PlayerPropsLabel>{t('markets.market-card.player-props')}</PlayerPropsLabel>
                                    )}
                                    <TotalMarketsContainer>
                                        <TotalMarketsLabel>{t('markets.market-card.total-markets')}</TotalMarketsLabel>
                                        <TotalMarkets>{MAX_NUMBER_OF_MARKETS_COUNT}</TotalMarkets>
                                        <TotalMarketsArrow
                                            className={isExpanded ? 'icon icon--arrow-up' : 'icon icon--arrow-down'}
                                            onClick={() => setIsExpanded(!isExpanded)}
                                        />
                                    </TotalMarketsContainer>
                                </TotalMarketsWrapper>
                            )} */}
                        </>
                    )}
                </OddsWrapper>
                {isGameRegularlyResolved ? (
                    <ResultWrapper>
                        <ResultLabel>
                            {!market.isOneSideMarket ? `${t('markets.market-card.result')}:` : ''}
                        </ResultLabel>
                        <Result>
                            {market.isOneSideMarket
                                ? market.homeScore == 1
                                    ? t('markets.market-card.race-winner')
                                    : t('markets.market-card.no-win')
                                : Number(market.leagueId) != 9007
                                ? `${market.homeScore} - ${market.awayScore}`
                                : ''}
                            {Number(market.leagueId) == 9007 ? (
                                <>
                                    {Number(market.homeScore) > 0
                                        ? `W - L (R${market.homeScore})`
                                        : `L - W (R${market.awayScore})`}
                                </>
                            ) : (
                                ''
                            )}
                        </Result>
                    </ResultWrapper>
                ) : (
                    <MatchStatus
                        isPendingResolution={isPendingResolution}
                        liveResultInfo={liveResultInfo}
                        isCanceled={market.isCanceled}
                        isPaused={market.isPaused}
                        isEnetpulseSport={isEnetpulseSport}
                        isJsonOddsSport={isJsonOddsSport}
                    />
                )}
            </MainContainer>
            {/* {(showSecondRowOnMobile || showSecondRowOnDesktop) && showOdds && isExpanded && (
                <>
                    <SecondRowContainer mobilePaddingRight={isMaxNumberOfChildMarkets ? 4 : 20}>
                        <OddsWrapper>
                            {isMobile && doubleChanceMarkets.length > 0 && (
                                <Odds
                                    market={doubleChanceMarkets[0]}
                                    doubleChanceMarkets={doubleChanceMarkets}
                                    isShownInSecondRow
                                />
                            )}
                            {!showOnlyCombinedPositionsInSecondRow &&
                                spreadTotalMarkets.map((childMarket) => (
                                    <Odds market={childMarket} key={childMarket.address} isShownInSecondRow />
                                ))}
                            {hasCombinedMarkets && !isMobile && showOnlyCombinedPositionsInSecondRow && (
                                <CombinedMarketsOdds market={market} isShownInSecondRow />
                            )}
                        </OddsWrapper>
                    </SecondRowContainer>
                    {isMobile && hasCombinedMarkets && (
                        <ThirdRowContainer mobilePaddingRight={isMaxNumberOfChildMarkets ? 4 : 20}>
                            <OddsWrapper>
                                <CombinedMarketsOdds market={market} isShownInSecondRow />
                            </OddsWrapper>
                        </ThirdRowContainer>
                    )}
                    {!isMobile && hasCombinedMarkets && doubleChanceMarkets.length > 0 && (
                        <ThirdRowContainer mobilePaddingRight={isMaxNumberOfChildMarkets ? 4 : 20}>
                            <OddsWrapper>
                                <CombinedMarketsOdds market={market} isShownInSecondRow />
                            </OddsWrapper>
                        </ThirdRowContainer>
                    )}
                    {hasPlayerPropsMarkets && <PlayerPropsOdds markets={playerPropsMarkets} />}
                </>
            )} */}
        </Wrapper>
    );
};

export default MarketListCard;
