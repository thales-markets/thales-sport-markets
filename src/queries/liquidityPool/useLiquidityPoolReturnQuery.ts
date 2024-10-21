import QUERY_KEYS from 'constants/queryKeys';
import { orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { LiquidityPoolReturn } from 'types/liquidityPool';
import { QueryConfig } from 'types/network';

const APR_FREQUENCY = 52;
const arrToApy = (arr: number) => (1 + arr) ** APR_FREQUENCY - 1;

const useLiquidityPoolReturnQuery = (
    liquidityPoolAddress: string,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LiquidityPoolReturn | undefined>({
        queryKey: QUERY_KEYS.LiquidityPool.Return(queryConfig.networkId, liquidityPoolAddress),
        queryFn: async () => {
            try {
                const liquidityPoolPnls = await thalesData.sportMarketsV2.liquidityPoolPnls({
                    network: queryConfig.networkId,
                    liquidityPool: liquidityPoolAddress,
                });
                const numberOfRounds = liquidityPoolPnls.length;
                const sumPnl = orderBy(liquidityPoolPnls, ['round'], ['asc']).reduce(
                    (partialSum, item) => partialSum + item.pnl - 1,
                    0
                );

                const arr = sumPnl / numberOfRounds;
                const apr = arr * APR_FREQUENCY;
                const apy = arrToApy(arr);

                return {
                    arr,
                    apr,
                    apy,
                };
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        ...options,
    });
};

export default useLiquidityPoolReturnQuery;
