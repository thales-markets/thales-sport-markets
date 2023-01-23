import { useQuery, UseQueryOptions } from 'react-query';
import { Position } from '../../constants/options';
import { AvailablePerDoubleChancePosition, MarketData } from '../../types/markets';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from '../../utils/networkConnector';
import { bigNumberFormatter } from '../../utils/formatters/ethers';
import { ethers } from 'ethers';
import { DoubleChanceMarketType } from 'constants/tags';

const useAvailablePerDoubleChancePositionQuery = (
    markets: MarketData[],
    options?: UseQueryOptions<AvailablePerDoubleChancePosition | undefined>
) => {
    return useQuery<AvailablePerDoubleChancePosition | undefined>(
        QUERY_KEYS.AvailablePerDoubleChancePosition(markets.length > 0 ? markets[0].parentMarket : ''),
        async () => {
            try {
                const sportsAMMContract = networkConnector.sportsAMMContract;

                const availablePerDoubleChancePosition = await Promise.all(
                    markets.map(async (market) => {
                        const [availableToBuyHome, homePositionPriceImpact] = await Promise.all([
                            sportsAMMContract?.availableToBuyFromAMM(market.address, Position.HOME),
                            sportsAMMContract?.buyPriceImpact(
                                market.address,
                                Position.HOME,
                                ethers.utils.parseEther('1')
                            ),
                        ]);

                        return {
                            doubleChanceMarketType: market.doubleChanceMarketType,
                            postions: {
                                available: bigNumberFormatter(availableToBuyHome),
                                buyBonus: -(
                                    (bigNumberFormatter(homePositionPriceImpact) /
                                        (1 + bigNumberFormatter(homePositionPriceImpact))) *
                                    100
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
