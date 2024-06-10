import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { LiquidityPoolPnls, LiquidityPoolType } from 'types/liquidityPool';

const useLiquidityPoolPnlsQuery = (
    networkId: Network,
    liquidityPoolType: LiquidityPoolType,
    options?: UseQueryOptions<LiquidityPoolPnls>
) => {
    return useQuery<LiquidityPoolPnls>(
        QUERY_KEYS.LiquidityPool.PnL(networkId, liquidityPoolType),
        async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.LPPnls}/${networkId}?lp-type=${liquidityPoolType}`
                );

                const liquidityPoolPnls = response?.data ? response.data : [];

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
