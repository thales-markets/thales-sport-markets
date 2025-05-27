import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { SportMarket, SportMarkets } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { getProtectedApiRoute } from 'utils/api';

// without this every request is treated as new even though it has the same response
const marketsCache = { live: [] as SportMarkets };

const useLiveSportsMarketsQuery = (
    isLiveSelected: boolean,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<{ live: SportMarkets }>({
        queryKey: QUERY_KEYS.LiveSportMarkets(networkConfig.networkId),
        queryFn: async () => {
            try {
                const response = await axios.get<undefined, { data: { markets: SportMarkets } }>(
                    getProtectedApiRoute(networkConfig.networkId, 'live-markets'),
                    noCacheConfig
                );

                const markets: SportMarkets = response?.data?.markets || marketsCache.live;

                const marketsFlattened: SportMarkets = markets
                    .reduce((accumulator: SportMarkets, value) => accumulator.concat(value), [])
                    .map((game: SportMarket) => {
                        game.childMarkets = game.childMarkets.map((childMarket: any) => {
                            childMarket.live = true; // TODO: remove this property from business logic on UI
                            childMarket.maturityDate = new Date(childMarket.maturityDate);
                            childMarket.odds = childMarket.odds.map((odd: any) => odd.normalizedImplied);
                            return childMarket;
                        });
                        game.live = true; // TODO: remove this property from business logic on UI(we can leave this one for parent, but child markets shouldnt have live flag)
                        game.maturityDate = new Date(game.maturityDate);
                        game.odds = game.odds.map((odd: any) => odd.normalizedImplied);
                        return game;
                    });
                marketsCache.live = marketsFlattened;
                return { live: marketsFlattened };
            } catch (e) {
                console.log(e);
            }

            return marketsCache;
        },
        refetchInterval: secondsToMilliseconds(isLiveSelected ? 2 : 10),
        ...options,
    });
};

export default useLiveSportsMarketsQuery;
