import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { orderBy } from 'lodash';
import { SportMarket, Team } from 'types/markets';
import { QueryConfig } from 'types/network';

const useSportMarketQuery = (
    marketAddress: string,
    onlyOpenChildMarkets: boolean,
    isLive: boolean,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<SportMarket | undefined>({
        queryKey: QUERY_KEYS.SportMarketV2(marketAddress, queryConfig.networkId, isLive),
        queryFn: async () => {
            const enableOnlyOpenChildMarkets = onlyOpenChildMarkets && !isLive;
            try {
                const [marketResponse, gameInfoResponse, liveScoreResponse] = await Promise.all([
                    axios.get(
                        `${generalConfig.API_URL}/overtime-v2/networks/${queryConfig.networkId}/${
                            isLive ? 'live-' : ''
                        }markets/${marketAddress}`,
                        noCacheConfig
                    ),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/games-info/${marketAddress}`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores/${marketAddress}`, noCacheConfig),
                ]);

                const market = marketResponse.data;
                const gameInfo = gameInfoResponse.data;
                const liveScore = liveScoreResponse.data;

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
                            .filter(
                                (childMarket: any) =>
                                    (enableOnlyOpenChildMarkets && childMarket.isOpen) || !enableOnlyOpenChildMarkets
                            )
                            .map((childMarket: any) => {
                                return {
                                    ...childMarket,
                                    live: isLive,
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
                    live: isLive,
                };
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        refetchInterval: secondsToMilliseconds(isLive ? 2 : 10),
        ...options,
    });
};

export default useSportMarketQuery;
