import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { CombinedMarketsContractData, SportMarketInfo } from 'types/markets';
import thalesData from 'thales-data';
import { Network } from 'enums/network';
import networkConnector from 'utils/networkConnector';
import { insertCombinedMarketsIntoArrayOFMarkets } from 'utils/combinedMarkets';
import { getIsOneSideMarket, getMarketAddressesFromSportMarketArray } from 'utils/markets';
import { getDefaultDecimalsForNetwork, bigNumberFormatter } from 'thales-utils';

const useSportMarketQuery = (
    marketAddress: string,
    networkId: Network,
    options?: UseQueryOptions<SportMarketInfo | undefined>
) => {
    return useQuery<SportMarketInfo | undefined>(
        QUERY_KEYS.SportMarket(marketAddress, networkId),
        async () => {
            try {
                const { sportPositionalMarketDataContract } = networkConnector;

                const parentMarketFromGraph: SportMarketInfo[] = await thalesData.sportMarkets.markets({
                    network: networkId,
                    market: marketAddress,
                });

                const childMarkets: SportMarketInfo[] = await thalesData.sportMarkets.markets({
                    network: networkId,
                    parentMarket: marketAddress,
                });

                const parentMarketData = await sportPositionalMarketDataContract?.getMarketData(marketAddress);

                if (parentMarketFromGraph) {
                    const parentMarket = parentMarketFromGraph[0];
                    parentMarket.isOneSideMarket = getIsOneSideMarket(Number(parentMarket.tags[0]));
                    parentMarket.childMarkets = childMarkets;
                    const marketAddresses = getMarketAddressesFromSportMarketArray([parentMarket]);
                    parentMarket.homeOdds = parentMarketData.odds[0]
                        ? bigNumberFormatter(parentMarketData.odds[0], getDefaultDecimalsForNetwork(networkId))
                        : 0;
                    parentMarket.awayOdds = parentMarketData.odds[1]
                        ? bigNumberFormatter(parentMarketData.odds[1], getDefaultDecimalsForNetwork(networkId))
                        : 0;
                    parentMarket.drawOdds = parentMarketData.odds[2]
                        ? bigNumberFormatter(parentMarketData.odds[2], getDefaultDecimalsForNetwork(networkId))
                        : 0;
                    parentMarket.gameId = parentMarketData.gameId;

                    // Child Markets contract odds
                    for (let i = 0; i < parentMarket.childMarkets.length; i++) {
                        const marketDataOfChildMarket = await sportPositionalMarketDataContract?.getMarketData(
                            parentMarket.childMarkets[i].address
                        );

                        marketDataOfChildMarket.odds[0]
                            ? (parentMarket.childMarkets[i].homeOdds = bigNumberFormatter(
                                  marketDataOfChildMarket.odds[0],
                                  getDefaultDecimalsForNetwork(networkId)
                              ))
                            : 0;
                        marketDataOfChildMarket.odds[1]
                            ? (parentMarket.childMarkets[i].awayOdds = bigNumberFormatter(
                                  marketDataOfChildMarket.odds[1],
                                  getDefaultDecimalsForNetwork(networkId)
                              ))
                            : 0;
                        marketDataOfChildMarket.odds[2]
                            ? (parentMarket.childMarkets[i].drawOdds = bigNumberFormatter(
                                  marketDataOfChildMarket.odds[2],
                                  getDefaultDecimalsForNetwork(networkId)
                              ))
                            : 0;
                    }

                    const combinedMarketsContractData:
                        | CombinedMarketsContractData
                        | undefined = await sportPositionalMarketDataContract?.getCombinedOddsForBatchOfMarkets(
                        marketAddresses
                    );

                    if (combinedMarketsContractData) {
                        const modifiedMarkets = insertCombinedMarketsIntoArrayOFMarkets(
                            [parentMarket],
                            combinedMarketsContractData
                        );

                        return modifiedMarkets[0];
                    }

                    return parentMarket;
                }

                return undefined;
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

export default useSportMarketQuery;
