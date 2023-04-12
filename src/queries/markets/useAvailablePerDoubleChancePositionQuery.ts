import { useQuery, UseQueryOptions } from 'react-query';
import { AvailablePerDoubleChancePosition, MarketData } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { DoubleChanceMarketType } from 'constants/tags';
import { convertPriceImpactToBonus } from 'utils/markets';

const useAvailablePerDoubleChancePositionQuery = (
    markets: MarketData[],
    options?: UseQueryOptions<AvailablePerDoubleChancePosition | undefined>
) => {
    return useQuery<AvailablePerDoubleChancePosition | undefined>(
        QUERY_KEYS.AvailablePerDoubleChancePosition(markets.length > 0 ? markets[0].parentMarket : ''),
        async () => {
            try {
                const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;

                const availablePerDoubleChancePosition = await Promise.all(
                    markets.map(async (market) => {
                        const marketLiquidityAndPriceImpact = await sportPositionalMarketDataContract?.getMarketLiquidityAndPriceImpact(
                            market.address
                        );

                        return {
                            doubleChanceMarketType: market.doubleChanceMarketType,
                            postions: {
                                available: bigNumberFormatter(marketLiquidityAndPriceImpact.homeLiquidity),
                                buyBonus: convertPriceImpactToBonus(
                                    bigNumberFormatter(marketLiquidityAndPriceImpact.homePriceImpact)
                                ),
                            },
                        };
                    })
                );
                return Object.assign(
                    {},
                    ...availablePerDoubleChancePosition.map((item) => ({
                        [item.doubleChanceMarketType as DoubleChanceMarketType]: item.postions,
                    }))
                ) as AvailablePerDoubleChancePosition;
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

export default useAvailablePerDoubleChancePositionQuery;
