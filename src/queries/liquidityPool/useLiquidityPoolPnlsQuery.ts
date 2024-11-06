import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { orderBy } from 'lodash';
import thalesData from 'thales-data';
import { LiquidityPoolPnls } from 'types/liquidityPool';
import { QueryConfig } from 'types/network';

const useLiquidityPoolPnlsQuery = (
    liquidityPoolAddress: string,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LiquidityPoolPnls>({
        queryKey: QUERY_KEYS.LiquidityPool.PnL(queryConfig.networkId, liquidityPoolAddress),
        queryFn: async () => {
            try {
                const liquidityPoolPnls = await thalesData.sportMarketsV2.liquidityPoolPnls({
                    network: queryConfig.networkId,
                    liquidityPool: liquidityPoolAddress,
                });

                let cumulativePnl = 1;
                return orderBy(liquidityPoolPnls, ['round'], ['asc']).map((item: any) => {
                    cumulativePnl = cumulativePnl * item.pnl;
                    return {
                        round: `R${item.round}`,
                        pnlPerRound: item.pnl - 1,
                        cumulativePnl: cumulativePnl - 1,
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

export default useLiquidityPoolPnlsQuery;
