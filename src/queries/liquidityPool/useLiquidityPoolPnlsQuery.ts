import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'types/network';
import { LiquidityPoolPnls } from 'types/liquidityPool';
import { orderBy } from 'lodash';

const useLiquidityPoolPnlsQuery = (networkId: NetworkId, options?: UseQueryOptions<LiquidityPoolPnls>) => {
    return useQuery<LiquidityPoolPnls>(
        QUERY_KEYS.LiquidityPool.PnL(networkId),
        async () => {
            try {
                const liquidityPoolPnls = await thalesData.sportMarkets.liquidityPoolPnls({
                    network: networkId,
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
        {
            ...options,
        }
    );
};

export default useLiquidityPoolPnlsQuery;
