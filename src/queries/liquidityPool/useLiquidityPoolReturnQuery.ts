import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { LiquidityPoolReturn, LiquidityPoolType } from 'types/liquidityPool';
import { orderBy } from 'lodash';

const APR_FREQUENCY = 52;
const arrToApy = (arr: number) => (1 + arr) ** APR_FREQUENCY - 1;

const useLiquidityPoolReturnQuery = (
    networkId: Network,
    liquidityPoolType: LiquidityPoolType,
    options?: UseQueryOptions<LiquidityPoolReturn | undefined>
) => {
    return useQuery<LiquidityPoolReturn | undefined>(
        QUERY_KEYS.LiquidityPool.Return(networkId, liquidityPoolType),
        async () => {
            try {
                const liquidityPoolPnls = await thalesData.sportMarkets.liquidityPoolPnls({
                    network: networkId,
                    liquidityPoolType,
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
        {
            ...options,
        }
    );
};

export default useLiquidityPoolReturnQuery;
