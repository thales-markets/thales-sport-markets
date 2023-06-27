import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'types/network';
import { LiquidityPoolType, LiquidityPoolUserTransactions } from 'types/liquidityPool';

const useLiquidityPoolUserTransactionsQuery = (
    networkId: NetworkId,
    liquidityPoolType: LiquidityPoolType,
    options?: UseQueryOptions<LiquidityPoolUserTransactions>
) => {
    return useQuery<LiquidityPoolUserTransactions>(
        QUERY_KEYS.LiquidityPool.UserTransactions(networkId, liquidityPoolType),
        async () => {
            try {
                const liquidityPoolUserTransactions = await thalesData.sportMarkets.liquidityPoolUserTransactions({
                    network: networkId,
                    liquidityPoolType,
                });
                return liquidityPoolUserTransactions;
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
