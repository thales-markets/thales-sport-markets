import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { SportMarketInfo } from 'types/markets';
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

                const [parentMarketFromGraph, childMarkets] = await Promise.all([
                    thalesData.sportMarkets.markets({
                        network: networkId,
                        market: marketAddress,
                    }),
                    thalesData.sportMarkets.markets({
                        network: networkId,
                        parentMarket: marketAddress,
                    }),
                ]);

                const parentMarket = parentMarketFromGraph ? parentMarketFromGraph[0] : undefined;
                const marketAddresses = getMarketAddressesFromSportMarketArray([parentMarket]);

                const [parentMarketData, combinedMarketsContractData] = await Promise.all([
                    sportPositionalMarketDataContract?.getMarketData(marketAddress),
                    sportPositionalMarketDataContract?.getCombinedOddsForBatchOfMarkets(marketAddresses),
                ]);

                if (parentMarketFromGraph) {
                    parentMarket.isOneSideMarket = getIsOneSideMarket(Number(parentMarket.tags[0]));
                    parentMarket.childMarkets = childMarkets;
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
                    const childMarketsOddsPromises = [];

                    for (let i = 0; i < parentMarket.childMarkets.length; i++) {
                        childMarketsOddsPromises.push(
                            sportPositionalMarketDataContract?.getMarketData(parentMarket.childMarkets[i].address)
                        );
                    }

                    const childMarketOddsData = await Promise.all(childMarketsOddsPromises);

                    for (let i = 0; i < childMarketOddsData.length; i++) {
                        childMarketOddsData[i].odds[0]
                            ? (parentMarket.childMarkets[i].homeOdds = bigNumberFormatter(
                                  childMarketOddsData[i].odds[0],
                                  getDefaultDecimalsForNetwork(networkId)
                              ))
                            : 0;
                        childMarketOddsData[i].odds[1]
                            ? (parentMarket.childMarkets[i].homeOdds = bigNumberFormatter(
                                  childMarketOddsData[i].odds[1],
                                  getDefaultDecimalsForNetwork(networkId)
                              ))
                            : 0;
                        childMarketOddsData[i].odds[2]
                            ? (parentMarket.childMarkets[i].homeOdds = bigNumberFormatter(
                                  childMarketOddsData[i].odds[2],
                                  getDefaultDecimalsForNetwork(networkId)
                              ))
                            : 0;
                    }

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
