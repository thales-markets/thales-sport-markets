import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { SportMarket, Team } from 'types/markets';

const useSportMarketQuery = (
    marketAddress: string,
    onlyOpenChildMarkets: boolean,
    networkId: Network,
    options?: UseQueryOptions<SportMarket | undefined>
) => {
    return useQuery<SportMarket | undefined>(
        QUERY_KEYS.SportMarketV2(marketAddress, networkId),
        async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/markets/${marketAddress}`,
                    { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' } }
                );
                const market = response.data;

                const gamesInfoResponse = await axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, {
                    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
                });
                const gamesInfo = gamesInfoResponse.data;
                const gameInfo = gamesInfo[market.gameId];

                const homeTeam = !!gameInfo && gameInfo.teams.find((team: Team) => team.isHome);
                const homeScore = homeTeam ? homeTeam.score : 0;
                const homeScoreByPeriod = homeTeam ? homeTeam.scoreByPeriod : [];

                const awayTeam = !!gameInfo && gameInfo.teams.find((team: Team) => !team.isHome);
                const awayScore = awayTeam ? awayTeam.score : 0;
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
                                };
                            }),
                        ['typeId'],
                        ['asc']
                    ),
                    tournamentName: gameInfo ? gameInfo.tournamentName : undefined,
                    tournamentRound: gameInfo ? gameInfo.tournamentRound : undefined,
                    homeScore,
                    awayScore,
                    homeScoreByPeriod,
                    awayScoreByPeriod,
                    isGameFinished: gameInfo ? gameInfo.isGameFinished : undefined,
                };
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            ...options,
        }
    );
};

export default useSportMarketQuery;
