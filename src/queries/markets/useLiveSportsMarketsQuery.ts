import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { UseQueryOptions, useQuery } from 'react-query';
import { SportMarkets } from 'types/markets';

const useLiveSportsMarketsQuery = (
    networkId: Network,
    isLiveSelected: boolean,
    options?: UseQueryOptions<SportMarkets>
) => {
    return useQuery<SportMarkets>(
        QUERY_KEYS.LiveSportMarkets(networkId),
        async () => {
            let markets: any[] = [];
            try {
                const response = await axios.get<undefined, { data: { errors: string[]; markets: SportMarkets } }>(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/live-markets`,
                    { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' } }
                );

                markets = response?.data?.markets || [];
            } catch (e) {
                console.log(e);
            }

            const marketsFlattened = markets
                .reduce((accumulator, value) => accumulator.concat(value), [])
                .map((game: any) => {
                    return {
                        ...game,
                        live: true,
                        maturityDate: new Date(game.maturityDate),
                        odds: game.odds.map((odd: any) => odd.normalizedImplied),
                    };
                });

            return marketsFlattened;
        },
        {
            refetchInterval: isLiveSelected ? 2 * 1000 : 10 * 1000,
            ...options,
        }
    );
};

export default useLiveSportsMarketsQuery;
