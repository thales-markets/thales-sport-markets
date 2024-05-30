import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { StatusFilter } from 'enums/markets';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { UseQueryOptions, useQuery } from 'react-query';
import { SportMarkets, Team } from 'types/markets';

const useSportsMarketsV2Query = (
    statusFilter: StatusFilter,
    networkId: Network,
    options?: UseQueryOptions<SportMarkets>
) => {
    return useQuery<SportMarkets>(
        QUERY_KEYS.SportMarketsV2(statusFilter, networkId),
        async () => {
            try {
                const status = statusFilter.toLowerCase().split('market')[0];

                const [marketsResponse, gamesInfoResponse, liveScoresResponse] = await Promise.all([
                    axios.get(
                        `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/markets/?status=${status}&ungroup=true`,
                        noCacheConfig
                    ),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig),
                ]);
                const markets = marketsResponse.data;
                const gamesInfo = gamesInfoResponse.data;
                const liveScores = liveScoresResponse.data;

                return markets.map((market: any) => {
                    const gameInfo = gamesInfo[market.gameId];
                    const liveScore = liveScores[market.gameId];

                    const homeTeam = !!gameInfo && gameInfo.teams && gameInfo.teams.find((team: Team) => team.isHome);
                    const homeScore = homeTeam?.score;
                    const homeScoreByPeriod = homeTeam ? homeTeam.scoreByPeriod : [];

                    const awayTeam = !!gameInfo && gameInfo.teams && gameInfo.teams.find((team: Team) => !team.isHome);
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
            } catch (e) {
                console.log(e);
            }
            return [];
        },
        {
            refetchInterval: 5 * 1000,
            ...options,
        }
    );
};

export default useSportsMarketsV2Query;
