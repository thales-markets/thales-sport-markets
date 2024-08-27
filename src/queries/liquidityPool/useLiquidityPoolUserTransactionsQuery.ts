import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { coinFormatter, Coins } from 'thales-utils';
import { LiquidityPoolUserTransaction, LiquidityPoolUserTransactions } from 'types/liquidityPool';

const useLiquidityPoolUserTransactionsQuery = (
    networkId: Network,
    liquidityPoolAddress: string,
    collateral: Coins,
    options?: UseQueryOptions<LiquidityPoolUserTransactions>
) => {
    return useQuery<LiquidityPoolUserTransactions>(
        QUERY_KEYS.LiquidityPool.UserTransactions(networkId, liquidityPoolAddress),
        async () => {
            try {
                const liquidityPoolUserTransactions = await thalesData.sportMarketsV2.liquidityPoolUserTransactions({
                    network: networkId,
                    liquidityPool: liquidityPoolAddress,
                });

                return liquidityPoolUserTransactions.map((tx: LiquidityPoolUserTransaction) => ({
                    ...tx,
                    amount: coinFormatter(tx.amount || 0, networkId, collateral),
                }));
            } catch (e) {
                console.log(e);
                return [];
            }
        },
        {
            ...options,
        }
    );
};

export default useLiquidityPoolUserTransactionsQuery;
