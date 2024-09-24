import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { UseQueryOptions, useQuery } from 'react-query';
import { SportMarket, Team } from 'types/markets';

const useSportMarketQuery = (
    marketAddress: string,
    onlyOpenChildMarkets: boolean,
    isLive: boolean,
    networkId: Network,
    options?: UseQueryOptions<SportMarket | undefined>
) => {
    return useQuery<SportMarket | undefined>(
        QUERY_KEYS.SportMarketV2(marketAddress, networkId),
        async () => {
            try {
                const [marketResponse, gameInfoResponse, liveScoreResponse] = await Promise.all([
                    axios.get(
                        `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/${
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
                                    (onlyOpenChildMarkets && childMarket.isOpen) || !onlyOpenChildMarkets
                            )
                            .map((childMarket: any) => {
                                return {
                                    ...childMarket,
                                    maturityDate: new Date(childMarket.maturityDate),
                                    odds: childMarket.odds.map((odd: any) => odd.normalizedImplied),
                                    live: isLive,
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
        {
            refetchInterval: isLive ? 2 * 1000 : 10 * 1000,
            ...options,
        }
    );
};

export default useSportMarketQuery;
