import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { MarketTransactions } from 'types/markets';

const useMarketTransactionsQuery = (
    marketAddress: string,
    networkId: Network,
    account?: string,
    options?: UseQueryOptions<MarketTransactions | undefined>
) => {
    return useQuery<MarketTransactions | undefined>(
        QUERY_KEYS.MarketTransactions(marketAddress, networkId, account),
        async () => {
            try {
                const [marketTransactions, childMarketTransactions] = await Promise.all([
                    axios.get(
                        `${generalConfig.API_URL}/${API_ROUTES.Transactions}/${networkId}?account=${account}&market=${marketAddress}`
                    ),
                    axios.get(
                        `${generalConfig.API_URL}/${API_ROUTES.Transactions}/${networkId}?account=${account}&parent-market=${marketAddress}`
                    ),
                ]);

                return [
                    ...(marketTransactions?.data ? marketTransactions.data : []),
                    ...(childMarketTransactions?.data ? childMarketTransactions.data : []),
                ];
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

export default useMarketTransactionsQuery;
