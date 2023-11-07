import { useQuery, UseQueryOptions } from 'react-query';
import { AvailablePerPosition } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter } from 'thales-utils';
import { convertPriceImpactToBonus } from 'utils/markets';
import { Position } from 'enums/markets';

const useAvailablePerPositionQuery = (
    marketAddress: string,
    options?: UseQueryOptions<AvailablePerPosition | undefined>
) => {
    return useQuery<AvailablePerPosition | undefined>(
        QUERY_KEYS.AvailablePerPosition(marketAddress),
        async () => {
            try {
                const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;

                const marketLiquidityAndPriceImpact = await sportPositionalMarketDataContract?.getMarketLiquidityAndPriceImpact(
                    marketAddress
                );

                return {
                    [Position.HOME]: {
                        available: bigNumberFormatter(marketLiquidityAndPriceImpact.homeLiquidity),
                        buyBonus: convertPriceImpactToBonus(
                            bigNumberFormatter(marketLiquidityAndPriceImpact.homePriceImpact)
                        ),
                    },
                    [Position.AWAY]: {
                        available: bigNumberFormatter(marketLiquidityAndPriceImpact.awayLiquidity),
                        buyBonus: convertPriceImpactToBonus(
                            bigNumberFormatter(marketLiquidityAndPriceImpact.awayPriceImpact)
                        ),
                    },
                    [Position.DRAW]: {
                        available: bigNumberFormatter(marketLiquidityAndPriceImpact.drawLiquidity),
                        buyBonus: convertPriceImpactToBonus(
                            bigNumberFormatter(marketLiquidityAndPriceImpact.drawPriceImpact)
                        ),
                    },
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

export default useAvailablePerPositionQuery;
