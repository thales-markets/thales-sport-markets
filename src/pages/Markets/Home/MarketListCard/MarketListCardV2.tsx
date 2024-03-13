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
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { formatShortDateWithTime } from 'thales-utils';
import { SportMarketInfoV2, SportMarketLiveResult } from 'types/markets';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { isFifaWCGame, isIIHFWCGame, isUEFAGame } from 'utils/markets';
import { isOddValid } from 'utils/marketsV2';
import { buildMarketLink } from 'utils/routes';
import web3 from 'web3';
import { BetType } from '../../../../enums/markets';
import MatchStatus from './components/MatchStatus';
import OddsV2 from './components/OddsV2';
import PlayerPropsOddsV2 from './components/PlayerPropsOddsV2';
import {
    Arrow,
    ClubLogo,
    MainContainer,
    MatchInfoConatiner,
    MatchTimeLabel,
    OddsWrapper,
    PlayerPropsLabel,
    Result,
    ResultLabel,
    ResultWrapper,
    SecondRowContainer,
    TeamLogosConatiner,
    TeamNameLabel,
    TeamNamesConatiner,
    TeamsInfoConatiner,
    ThirdRowContainer,
    TotalMarkets,
    TotalMarketsArrow,
    TotalMarketsContainer,
    TotalMarketsLabel,
    TotalMarketsWrapper,
    VSLabel,
    Wrapper,
} from './styled-components';

const MAX_NUMBER_OF_CHILD_MARKETS_IN_FIRST_ROW = 2;

type MarketRowCardProps = {
    market: SportMarketInfoV2;
    language: string;
};

const MarketListCard: React.FC<MarketRowCardProps> = ({ market, language }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
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
    const gameIdString = web3.utils.hexToAscii(market.gameId);
    const gameDate = new Date(market.maturityDate).toISOString().split('T')[0];

    const doubleChanceMarkets = market.childMarkets.filter((market) => market.typeId === BetType.DOUBLE_CHANCE);
    const spreadTotalMarkets = market.childMarkets.filter(
        (market) => market.typeId === BetType.SPREAD || market.typeId === BetType.TOTAL
    );
    const combinedPositionsMarkets = market.childMarkets.filter(
        (market) =>
            market.typeId === BetType.COMBINED_POSITIONS ||
            market.typeId === BetType.HALFTIME ||
            market.typeId === BetType.HALFTIME_FULLTIME ||
            market.typeId === BetType.GOALS ||
            market.typeId === BetType.HALFTIME_FULLTIME_GOALS
    );
    const playerPropsMarkets = market.childMarkets.filter((market) => market.isPlayerPropsMarket);

    const hasChildMarkets = market.childMarkets.length > 0;
    const hasDoubleChanceMarkets = doubleChanceMarkets.length > 0;
    const hasCombinedMarkets = combinedPositionsMarkets.length > 0;
    const hasPlayerPropsMarkets = playerPropsMarkets.length > 0;

    const totalNumberOfMarkets = market.childMarkets.length + 1;
    const isMaxNumberOfChildMarketsInFirstRow = market.childMarkets.length > MAX_NUMBER_OF_CHILD_MARKETS_IN_FIRST_ROW;
    const showSecondRowOnDesktop = !isMobile && isMaxNumberOfChildMarketsInFirstRow;
    const showSecondRowOnMobile = isMobile && hasChildMarkets;

    const showOnlyCombinedPositionsInSecondRow =
        showSecondRowOnDesktop && !hasDoubleChanceMarkets && hasCombinedMarkets;

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

    const areChildMarketsOddsValid = market.childMarkets.some((childMarket) =>
        childMarket.odds.some((odd) => isOddValid(odd))
    );

    const areOddsValid = market.odds.some((odd) => isOddValid(odd));

    const hideGame = showOdds && !areOddsValid && !areChildMarketsOddsValid;

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
                            {!isMobile && (
                                <>
                                    {doubleChanceMarkets.map((childMarket, index) => (
                                        <OddsV2
                                            market={childMarket}
                                            key={`${childMarket.gameId}-${childMarket.type}-${index}`}
                                        />
                                    ))}
                                    {(!showSecondRowOnDesktop || showOnlyCombinedPositionsInSecondRow) &&
                                        spreadTotalMarkets.map((childMarket, index) => (
                                            <OddsV2
                                                market={childMarket}
                                                key={`${childMarket.gameId}-${childMarket.type}-${index}`}
                                            />
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
                                        <TotalMarkets>{totalNumberOfMarkets}</TotalMarkets>
                                        <TotalMarketsArrow
                                            className={isExpanded ? 'icon icon--arrow-up' : 'icon icon--arrow-down'}
                                            onClick={() => setIsExpanded(!isExpanded)}
                                        />
                                    </TotalMarketsContainer>
                                </TotalMarketsWrapper>
                            )}
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
            {(showSecondRowOnMobile || showSecondRowOnDesktop) && showOdds && isExpanded && (
                <>
                    <SecondRowContainer mobilePaddingRight={isMaxNumberOfChildMarketsInFirstRow ? 4 : 20}>
                        <OddsWrapper>
                            {isMobile &&
                                doubleChanceMarkets.map((childMarket, index) => (
                                    <OddsV2
                                        market={childMarket}
                                        key={`${childMarket.gameId}-${childMarket.type}-${index}`}
                                    />
                                ))}
                            {!showOnlyCombinedPositionsInSecondRow &&
                                spreadTotalMarkets.map((childMarket, index) => (
                                    <OddsV2
                                        market={childMarket}
                                        key={`${childMarket.gameId}-${childMarket.type}-${index}`}
                                    />
                                ))}
                            {!isMobile &&
                                showOnlyCombinedPositionsInSecondRow &&
                                combinedPositionsMarkets.map((childMarket, index) => (
                                    <OddsV2
                                        market={childMarket}
                                        key={`${childMarket.gameId}-${childMarket.type}-${index}`}
                                    />
                                ))}
                        </OddsWrapper>
                    </SecondRowContainer>
                    {hasCombinedMarkets && (isMobile || (!isMobile && !showOnlyCombinedPositionsInSecondRow)) && (
                        <ThirdRowContainer mobilePaddingRight={isMaxNumberOfChildMarketsInFirstRow ? 4 : 20}>
                            <OddsWrapper>
                                {combinedPositionsMarkets.map((childMarket, index) => (
                                    <OddsV2
                                        market={childMarket}
                                        key={`${childMarket.gameId}-${childMarket.type}-${index}`}
                                    />
                                ))}
                            </OddsWrapper>
                        </ThirdRowContainer>
                    )}
                    {hasPlayerPropsMarkets && <PlayerPropsOddsV2 markets={playerPropsMarkets} />}
                </>
            )}
        </Wrapper>
    );
};

export default MarketListCard;
