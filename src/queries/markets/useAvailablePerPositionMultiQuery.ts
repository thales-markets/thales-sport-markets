import { useQuery, UseQueryOptions } from 'react-query';
import { AvailablePerPosition, ParlaysMarket } from 'types/markets';
import QUERY_KEYS from 'constants/queryKeys';
import networkConnector from 'utils/networkConnector';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import { convertPriceImpactToBonus } from 'utils/markets';
import { Position } from 'enums/markets';

const useAvailablePerPositionMultiQuery = (
    marketAddresses: ParlaysMarket[],
    options?: UseQueryOptions<Record<string, AvailablePerPosition> | undefined>
) => {
    return useQuery<Record<string, AvailablePerPosition> | undefined>(
        QUERY_KEYS.AvailablePerPositionMulti(marketAddresses.map((market) => market.address).join('-')),
        async () => {
            const map = {} as Record<string, AvailablePerPosition>;
            const promises: any[] = [];
            const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;

            try {
                for (let i = 0; i < marketAddresses.length; i++) {
                    promises.push(
                        sportPositionalMarketDataContract?.getMarketLiquidityAndPriceImpact(marketAddresses[i].address)
                    );
                }

                const responses = await Promise.all(promises);

                for (let i = 0; i < marketAddresses.length; i++) {
                    const marketLiquidityAndPriceImpact = responses[i];
                    map[marketAddresses[i].address] = {
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
                }
            } catch (e) {
                console.log(e);
                return undefined;
            }

            return map;
        },
        {
            ...options,
        }
    );
};

export default useAvailablePerPositionMultiQuery;
