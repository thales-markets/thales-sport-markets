import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { LeagueMap } from 'constants/sports';
import { secondsToMilliseconds } from 'date-fns';
import { StatusFilter } from 'enums/markets';
import { Network } from 'enums/network';
import { League } from 'enums/sports';
import { orderBy } from 'lodash';
import { UseQueryOptions, useQuery } from 'react-query';
import { MarketsCache, Team } from 'types/markets';
import { packMarket } from '../../utils/marketsV2';

const marketsCache: MarketsCache = {
    [StatusFilter.OPEN_MARKETS]: [],
    [StatusFilter.ONGOING_MARKETS]: [],
    [StatusFilter.RESOLVED_MARKETS]: [],
    [StatusFilter.PAUSED_MARKETS]: [],
    [StatusFilter.CANCELLED_MARKETS]: [],
};

const useSportsMarketsV2Query = (
    statusFilter: StatusFilter,
    networkId: Network,
    gameIds?: string,
    options?: UseQueryOptions<MarketsCache>
) => {
    return useQuery<MarketsCache>(
        QUERY_KEYS.SportMarketsV2(statusFilter, networkId, gameIds),
        async () => {
            try {
                const status = statusFilter.toLowerCase().split('market')[0];
                const today = new Date();
                // API takes timestamp argument in seconds
                const minMaturity = Math.round(new Date(new Date().setDate(today.getDate() - 7)).getTime() / 1000); // show history for 7 days in the past
                const hasGameIds = gameIds && gameIds !== '';

                const [
                    marketsResponse,
                    gamesInfoResponse,
                    liveScoresResponse,
                    numberOfMarketsResponse,
                ] = await Promise.all([
                    axios.get(
                        `${
                            generalConfig.API_URL
                        }/overtime-v2/networks/${networkId}/markets/?status=${status}&ungroup=true&onlyBasicProperties=true&minMaturity=${minMaturity}${
                            hasGameIds ? `&gameIds=${gameIds}` : ''
                        }`,
                        noCacheConfig
                    ),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig),
                    axios.get(
                        `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/number-of-markets`,
                        noCacheConfig
                    ),
                ]);
                const markets = marketsResponse.data;
                const gamesInfo = gamesInfoResponse.data;
                const liveScores = liveScoresResponse.data;
                const numberOfMarkets = numberOfMarketsResponse.data;

                const mappedMarkets = markets
                    .filter((market: any) => !LeagueMap[market.leagueId as League]?.hidden)
                    .map((market: any) => {
                        const gameInfo = gamesInfo[market.gameId];
                        const liveScore = liveScores[market.gameId];
                        const numberOfMarketsPerGame = numberOfMarkets[market.gameId];

                        const homeTeam =
                            !!gameInfo && gameInfo.teams && gameInfo.teams.find((team: Team) => team.isHome);
                        const homeScore = homeTeam?.score;
                        const homeScoreByPeriod = homeTeam ? homeTeam.scoreByPeriod : [];

                        const awayTeam =
                            !!gameInfo && gameInfo.teams && gameInfo.teams.find((team: Team) => !team.isHome);
                        const awayScore = awayTeam?.score;
                        const awayScoreByPeriod = awayTeam ? awayTeam.scoreByPeriod : [];

                        return {
                            ...packMarket(market),
                            childMarkets: orderBy(
                                market.childMarkets
                                    .filter((childMarket: any) => market.status === childMarket.status)
                                    .map((childMarket: any) => {
                                        return {
                                            ...packMarket(childMarket, market),
                                        };
                                    }),
                                ['typeId'],
                                ['asc']
                            ),
                            tournamentName: gameInfo?.tournamentName,
                            tournamentRound: gameInfo?.tournamentRound,
                            homeScore,
                            awayScore,
                            homeScoreByPeriod,
                            awayScoreByPeriod,
                            isGameFinished: gameInfo?.isGameFinished,
                            gameStatus: gameInfo?.gameStatus,
                            liveScore,
                            numberOfMarkets: numberOfMarketsPerGame || 0,
                        };
                    });

                marketsCache[statusFilter] = mappedMarkets;

                return { ...marketsCache, [statusFilter]: mappedMarkets };
            } catch (e) {
                console.log(e);
            }
            return marketsCache;
        },
        {
            refetchInterval: secondsToMilliseconds(5),
            ...options,
        }
    );
};

export default useSportsMarketsV2Query;
