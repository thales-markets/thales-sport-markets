import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { MarketTransactions } from 'types/markets';
import { NetworkId } from 'types/network';

const useMarketTransactionsQuery = (
    marketAddress: string,
    networkId: NetworkId,
    account?: string,
    options?: UseQueryOptions<MarketTransactions | undefined>
) => {
    return useQuery<MarketTransactions | undefined>(
        QUERY_KEYS.MarketTransactions(marketAddress, networkId, account),
        async () => {
            try {
                const [marketTransactions, childMarketTransactions] = await Promise.all([
                    thalesData.sportMarkets.marketTransactions({
                        market: marketAddress,
                        network: networkId,
                        account,
                    }),
                    thalesData.sportMarkets.marketTransactions({
                        parentMarket: marketAddress,
                        network: networkId,
                        account,
                    }),
                ]);

                return [...marketTransactions, ...childMarketTransactions];
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
