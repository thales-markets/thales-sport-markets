import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { MarketData, ChildMarkets } from 'types/markets';
import networkConnector from 'utils/networkConnector';
import { bigNumberFormmaterWithDecimals } from '../../utils/formatters/ethers';
import { Position } from '../../constants/options';
import { groupBy, orderBy } from 'lodash';
import { BetType } from 'constants/tags';
import { NetworkId } from 'types/network';
import { getDefaultDecimalsForNetwork } from 'utils/collaterals';

const useChildMarketsQuery = (
    parentMarket: MarketData,
    networkId: NetworkId,
    options?: UseQueryOptions<ChildMarkets | undefined>
) => {
    return useQuery<ChildMarkets | undefined>(
        QUERY_KEYS.ChildMarkets(parentMarket.address, networkId),
        async () => {
            try {
                const childMarkets = await Promise.all(
                    parentMarket.childMarketsAddresses.map(async (childMarketAddress) => {
                        const sportPositionalMarketDataContract = networkConnector.sportPositionalMarketDataContract;

                        const marketData = await sportPositionalMarketDataContract?.getMarketData(childMarketAddress);

                        const market: MarketData = {
                            address: childMarketAddress.toLowerCase(),
                            gameDetails: parentMarket.gameDetails,
                            positions: {
                                [Position.HOME]: {
                                    odd: bigNumberFormmaterWithDecimals(
                                        marketData.odds[0],
                                        getDefaultDecimalsForNetwork(networkId)
                                    ),
                                },
                                [Position.AWAY]: {
                                    odd: bigNumberFormmaterWithDecimals(
                                        marketData.odds[1],
                                        getDefaultDecimalsForNetwork(networkId)
                                    ),
                                },
                                [Position.DRAW]: {
                                    odd: marketData.odds[2]
                                        ? bigNumberFormmaterWithDecimals(
                                              marketData.odds[2] || 0,
                                              getDefaultDecimalsForNetwork(networkId)
                                          )
                                        : undefined,
                                },
                            },
                            tags: [Number(marketData.firstTag)],
                            homeTeam: parentMarket.homeTeam,
                            awayTeam: parentMarket.awayTeam,
                            maturityDate: parentMarket.maturityDate,
                            resolved: marketData.resolved,
                            cancelled: marketData.cancelled,
                            finalResult: Number(marketData.finalResult),
                            gameStarted: parentMarket.gameStarted,
                            homeScore: parentMarket.homeScore,
                            awayScore: parentMarket.awayScore,
                            leagueRaceName: '',
                            paused: marketData.paused,
                            betType: Number(marketData.secondTag),
                            isApex: false,
                            parentMarket: parentMarket.address,
                            childMarketsAddresses: [],
                            childMarkets: [],
                            spread: Number(marketData.spread),
                            total: Number(marketData.total),
                            doubleChanceMarketType:
                                Number(marketData.secondTag) === BetType.DOUBLE_CHANCE ? marketData.gameLabel : null,
                        };

                        return market;
                    })
                );

                const groupedChildMarkets = groupBy(
                    orderBy(childMarkets, ['paused', 'cancelled'], ['asc', 'asc']),
                    (market: MarketData) => market.betType
                );
                return {
                    totalMarkets: groupedChildMarkets[BetType.TOTAL] || [],
                    spreadMarkets: groupedChildMarkets[BetType.SPREAD] || [],
                    doubleChanceMarkets: groupedChildMarkets[BetType.DOUBLE_CHANCE] || [],
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

export default useChildMarketsQuery;
