import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { UseQueryOptions, useQuery } from 'react-query';
import { SportMarket, SportMarkets } from 'types/markets';

// without this every request is treated as new even though it has the same response
const marketsCache = { live: [] as SportMarkets };

const useLiveSportsMarketsQuery = (
    networkId: Network,
    isLiveSelected: boolean,
    options?: UseQueryOptions<{ live: SportMarkets }>
) => {
    return useQuery<{ live: SportMarkets }>(
        QUERY_KEYS.LiveSportMarkets(networkId),
        async () => {
            try {
                const response = await axios.get<undefined, { data: { errors: string[]; markets: SportMarkets } }>(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/live-markets`,
                    { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' } }
                );

                marketsCache.live = response.data.markets.map(
                    (game: any): SportMarket => {
                        return {
                            ...game,
                            live: true,
                            maturityDate: new Date(game.maturityDate),
                            odds: game.odds.map((odd: any) => odd.normalizedImplied),
                        };
                    }
                );
            } catch (e) {
                console.log(e);
            }

            return marketsCache;
        },
        {
            refetchInterval: isLiveSelected ? 2 * 1000 : 10 * 1000,
            ...options,
        }
    );
};

export default useLiveSportsMarketsQuery;
