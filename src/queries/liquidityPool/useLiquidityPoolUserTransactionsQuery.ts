import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import thalesData from 'thales-data';
import { coinFormatter, Coins } from 'thales-utils';
import { LiquidityPoolUserTransaction, LiquidityPoolUserTransactions } from 'types/liquidityPool';
import { NetworkConfig } from 'types/network';

const useLiquidityPoolUserTransactionsQuery = (
    liquidityPoolAddress: string,
    collateral: Coins,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LiquidityPoolUserTransactions>({
        queryKey: QUERY_KEYS.LiquidityPool.UserTransactions(networkConfig.networkId, liquidityPoolAddress),
        queryFn: async () => {
            try {
                const liquidityPoolUserTransactions = await thalesData.sportMarketsV2.liquidityPoolUserTransactions({
                    network: networkConfig.networkId,
                    liquidityPool: liquidityPoolAddress,
                });

                return liquidityPoolUserTransactions.map((tx: LiquidityPoolUserTransaction) => {
                    return {
                        ...tx,
                        amount: coinFormatter(BigInt(tx.amount ? tx.amount : 0), networkConfig.networkId, collateral),
                    };
                });
            } catch (e) {
                console.log(e);
                return [];
            }
        },
        ...options,
    });
};

export default useLiquidityPoolUserTransactionsQuery;
