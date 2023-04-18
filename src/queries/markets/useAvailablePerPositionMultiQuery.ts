import { useQuery, UseQueryOptions } from 'react-query';
import { Position } from '../../constants/options';
import { AvailablePerPosition, ParlaysMarket } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { convertPriceImpactToBonus } from 'utils/markets';

const useAvailablePerPositionMultiQuery = (
    marketAddresses: ParlaysMarket[],
    options?: UseQueryOptions<Record<string, AvailablePerPosition> | undefined>
) => {
    return useQuery<Record<string, AvailablePerPosition> | undefined>(
        QUERY_KEYS.AvailablePerPositionMulti(marketAddresses),
        async () => {
            const map = {} as Record<string, AvailablePerPosition>;

            for (let i = 0; i < marketAddresses.length; i++) {
                const address = marketAddresses[i].address;

                try {
                    const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;

                    const marketLiquidityAndPriceImpact = await sportPositionalMarketDataContract?.getMarketLiquidityAndPriceImpact(
                        address
                    );

                    map[address] = {
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
            }

            return map;
        },
        {
            ...options,
        }
    );
};

export default useAvailablePerPositionMultiQuery;
