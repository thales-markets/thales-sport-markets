import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { SportMarketInfo } from 'types/markets';
import thalesData from 'thales-data';
import { NetworkId } from 'types/network';

const useSportMarketQuery = (
    marketAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<SportMarketInfo | undefined>
) => {
    return useQuery<SportMarketInfo | undefined>(
        QUERY_KEYS.SportMarket(marketAddress, networkId),
        async () => {
            try {
                const parentMarket = await thalesData.sportMarkets.markets({
                    network: networkId,
                    market: marketAddress,
                });

                const childMarkets = await thalesData.sportMarkets.markets({
                    network: networkId,
                    parentMarket: marketAddress,
                });

                if (parentMarket) {
                    parentMarket[0].childMarkets = childMarkets;
                    return parentMarket[0];
                }

                return undefined;
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
