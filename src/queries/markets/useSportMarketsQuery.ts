import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { SportMarketInfo, SportMarkets } from 'types/markets';
import { NetworkId } from 'types/network';

const useSportMarketsQuery = (networkId: NetworkId, options?: UseQueryOptions<SportMarkets | undefined>) => {
    return useQuery<SportMarkets | undefined>(
        QUERY_KEYS.SportMarkets(networkId),
        async () => {
            try {
                const markets = await thalesData.sportMarkets.markets({
                    network: networkId,
                });
                const mappedMarkets = markets.map((market: SportMarketInfo) => {
                    market.maturityDate = new Date(market.maturityDate);

                    return market;
                });

                return mappedMarkets;
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useSportMarketsQuery;
