import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { MarketTransactions } from 'types/markets';
import { NetworkId } from 'types/network';

const useMarketTransactionsQuery = (
    marketAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<MarketTransactions | undefined>
) => {
    return useQuery<MarketTransactions | undefined>(
        QUERY_KEYS.MarketTransactions(marketAddress, networkId),
        async () => {
            try {
                const marketTransactions = await thalesData.sportMarkets.marketTransactions({
                    market: marketAddress,
                    network: networkId,
                });

                return marketTransactions;
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

export default useMarketTransactionsQuery;
