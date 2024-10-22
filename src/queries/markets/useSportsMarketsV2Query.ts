import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { LeagueMap } from 'constants/sports';
import { secondsToMilliseconds } from 'date-fns';
import { StatusFilter } from 'enums/markets';
import { League } from 'enums/sports';
import { orderBy } from 'lodash';
import { UseQueryOptions, useQuery } from 'react-query';
import { MarketsCache, Team } from 'types/markets';
import { QueryConfig } from 'types/network';

const marketsCache: MarketsCache = {
    [StatusFilter.OPEN_MARKETS]: [],
    [StatusFilter.ONGOING_MARKETS]: [],
    [StatusFilter.RESOLVED_MARKETS]: [],
    [StatusFilter.PAUSED_MARKETS]: [],
    [StatusFilter.CANCELLED_MARKETS]: [],
};

const useSportsMarketsV2Query = (
    statusFilter: StatusFilter,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<MarketsCache>({
        queryKey: QUERY_KEYS.SportMarketsV2(statusFilter, queryConfig.networkId),
        queryFn: async () => {
            try {
                const status = statusFilter.toLowerCase().split('market')[0];
                const today = new Date();
                // APU takes timestamp argument in seconds
                const minMaturity = Math.round(new Date(new Date().setDate(today.getDate() - 7)).getTime() / 1000); // show history for 7 days in the past

                const [marketsResponse, gamesInfoResponse, liveScoresResponse] = await Promise.all([
                    axios.get(
                        `${generalConfig.API_URL}/overtime-v2/networks/${queryConfig.networkId}/markets/?status=${status}&ungroup=true&minMaturity=${minMaturity}`,
                        noCacheConfig
                    ),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig),
                ]);
                const markets = marketsResponse.data;
                const gamesInfo = gamesInfoResponse.data;
                const liveScores = liveScoresResponse.data;

                const mappedMarkets = markets
                    .filter((market: any) => !LeagueMap[market.leagueId as League].hidden)
                    .map((market: any) => {
                        const gameInfo = gamesInfo[market.gameId];
                        const liveScore = liveScores[market.gameId];

                        const homeTeam =
                            !!gameInfo && gameInfo.teams && gameInfo.teams.find((team: Team) => team.isHome);
                        const homeScore = homeTeam?.score;
                        const homeScoreByPeriod = homeTeam ? homeTeam.scoreByPeriod : [];

                        const awayTeam =
                            !!gameInfo && gameInfo.teams && gameInfo.teams.find((team: Team) => !team.isHome);
                        const awayScore = awayTeam?.score;
                        const awayScoreByPeriod = awayTeam ? awayTeam.scoreByPeriod : [];

                        return {
                            ...market,
                            maturityDate: new Date(market.maturityDate),
                            odds: market.odds.map((odd: any) => odd.normalizedImplied),
                            childMarkets: orderBy(
                                market.childMarkets
                                    .filter((childMarket: any) => market.status === childMarket.status)
                                    .map((childMarket: any) => {
                                        return {
                                            ...childMarket,
                                            maturityDate: new Date(childMarket.maturityDate),
                                            odds: childMarket.odds.map((odd: any) => odd.normalizedImplied),
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
                        };
                    });

                marketsCache[statusFilter] = mappedMarkets;

                return { ...marketsCache, [statusFilter]: mappedMarkets };
            } catch (e) {
                console.log(e);
            }
            return marketsCache;
        },
        refetchInterval: secondsToMilliseconds(5),
        ...options,
    });
};

export default useSportsMarketsV2Query;
