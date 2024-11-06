import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import thalesData from 'thales-data';
import { coinFormatter, Coins } from 'thales-utils';
import { LiquidityPoolUserTransaction, LiquidityPoolUserTransactions } from 'types/liquidityPool';
import { QueryConfig } from 'types/network';

const useLiquidityPoolUserTransactionsQuery = (
    liquidityPoolAddress: string,
    collateral: Coins,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LiquidityPoolUserTransactions>({
        queryKey: QUERY_KEYS.LiquidityPool.UserTransactions(queryConfig.networkId, liquidityPoolAddress),
        queryFn: async () => {
            try {
                const liquidityPoolUserTransactions = await thalesData.sportMarketsV2.liquidityPoolUserTransactions({
                    network: queryConfig.networkId,
                    liquidityPool: liquidityPoolAddress,
                });

                return liquidityPoolUserTransactions.map((tx: LiquidityPoolUserTransaction) => ({
                    ...tx,
                    amount: coinFormatter((tx.amount as unknown) as bigint, queryConfig.networkId, collateral),
                }));
            } catch (e) {
                console.log(e);
                return [];
            }
        },
        ...options,
    });
};

export default useLiquidityPoolUserTransactionsQuery;
