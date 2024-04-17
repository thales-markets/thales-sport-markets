import TimeRemaining from 'components/TimeRemaining';
import Tooltip from 'components/Tooltip';
import { ENETPULSE_SPORTS, FIFA_WC_TAG, FIFA_WC_U20_TAG, JSON_ODDS_SPORTS, SPORTS_TAGS_MAP } from 'constants/tags';
import useEnetpulseAdditionalDataQuery from 'queries/markets/useEnetpulseAdditionalDataQuery';
import useJsonOddsAdditionalDataQuery from 'queries/markets/useJsonOddsAdditionalDataQuery';
import useSportMarketLiveResultQuery from 'queries/markets/useSportMarketLiveResultQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { formatShortDateWithTime } from 'thales-utils';
import { SportMarketInfoV2, SportMarketLiveResult } from 'types/markets';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { isFifaWCGame, isIIHFWCGame, isUEFAGame } from 'utils/markets';
import { isOddValid } from 'utils/marketsV2';
import web3 from 'web3';
import { BetType } from '../../../../enums/markets';
import { getIsMarketSelected, setSelectedMarket } from '../../../../redux/modules/market';
import PositionsV2 from '../../Market/MarketDetailsV2/components/PositionsV2';
import MatchStatus from './components/MatchStatus';
import {
    ClubLogo,
    MainContainer,
    MatchInfoConatiner,
    MatchTimeLabel,
    Result,
    ResultLabel,
    ResultWrapper,
    TeamLogosConatiner,
    TeamNameLabel,
    TeamNamesConatiner,
    TeamsInfoConatiner,
    Wrapper,
} from './styled-components';

type MarketRowCardProps = {
    market: SportMarketInfoV2;
    language: string;
};

const MarketListCard: React.FC<MarketRowCardProps> = ({ market, language }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isAppReady = useSelector(getIsAppReady);
    const isMarketSelected = useSelector(getIsMarketSelected);
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
    const showOdds = !isPendingResolution && !isGameResolved && !market.isPaused && !isMarketSelected;
    const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(market.leagueId));
    const isJsonOddsSport = JSON_ODDS_SPORTS.includes(Number(market.leagueId));
    const gameIdString = web3.utils.hexToAscii(market.gameId);
    const gameDate = new Date(market.maturityDate).toISOString().split('T')[0];

    // const totalNumberOfMarkets = market.childMarkets.length + 1;

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
        <Wrapper hideGame={hideGame} isResolved={isGameRegularlyResolved} isMarketSelected={isMarketSelected}>
            <MainContainer>
                <MatchInfoConatiner onClick={() => dispatch(setSelectedMarket(market.gameId))}>
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
                        (liveResultInfo || localStorage.getItem(market.gameId)) &&
                        !isMarketSelected ? (
                            <>
                                {localStorage.getItem(market.gameId)}
                                {SPORTS_TAGS_MAP['Tennis'].includes(Number(market.leagueId)) && (
                                    <Tooltip overlay={t(`common.tennis-tooltip`)} iconFontSize={12} marginLeft={2} />
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
                                    market.leagueId == FIFA_WC_TAG || market.leagueId == FIFA_WC_U20_TAG ? '17px' : ''
                                }
                                width={
                                    market.leagueId == FIFA_WC_TAG || market.leagueId == FIFA_WC_U20_TAG ? '27px' : ''
                                }
                                alt="Home team logo"
                                src={homeLogoSrc}
                                onError={getOnImageError(setHomeLogoSrc, market.leagueId)}
                            />
                            {!market.isOneSideMarket && (
                                <>
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
                                        awayTeam={true}
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
                </MatchInfoConatiner>
                {showOdds && <PositionsV2 markets={[market]} betType={BetType.WINNER} showOdds={false} hideArrow />}
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
        </Wrapper>
    );
};

export default MarketListCard;
