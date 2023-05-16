import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { CombinedMarketsContractData, SportMarketInfo } from 'types/markets';
import thalesData from 'thales-data';
import { NetworkId } from 'types/network';
import networkConnector from 'utils/networkConnector';
import { insertCombinedMarketsIntoArrayOFMarkets } from 'utils/combinedMarkets';
import { getMarketAddressesFromSportMarketArray } from 'utils/markets';
import { getDefaultDecimalsForNetwork } from 'utils/collaterals';
import { bigNumberFormmaterWithDecimals } from 'utils/formatters/ethers';

const useSportMarketQuery = (
    marketAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<SportMarketInfo | undefined>
) => {
    return useQuery<SportMarketInfo | undefined>(
        QUERY_KEYS.SportMarket(marketAddress, networkId),
        async () => {
            try {
                const { sportPositionalMarketDataContract } = networkConnector;

                const parentMarket: SportMarketInfo[] = await thalesData.sportMarkets.markets({
                    network: networkId,
                    market: marketAddress,
                });

                const childMarkets: SportMarketInfo[] = await thalesData.sportMarkets.markets({
                    network: networkId,
                    parentMarket: marketAddress,
                });

                const parentMarketData = await sportPositionalMarketDataContract?.getMarketData(marketAddress);

                if (parentMarket) {
                    parentMarket[0].childMarkets = childMarkets;
                    const marketAddresses = getMarketAddressesFromSportMarketArray(parentMarket);
                    parentMarket[0].homeOdds = parentMarketData.odds[0]
                        ? bigNumberFormmaterWithDecimals(
                              parentMarketData.odds[0],
                              getDefaultDecimalsForNetwork(networkId)
                          )
                        : 0;
                    parentMarket[0].awayOdds = parentMarketData.odds[1]
                        ? bigNumberFormmaterWithDecimals(
                              parentMarketData.odds[1],
                              getDefaultDecimalsForNetwork(networkId)
                          )
                        : 0;
                    parentMarket[0].drawOdds = parentMarketData.odds[2]
                        ? bigNumberFormmaterWithDecimals(
                              parentMarketData.odds[2],
                              getDefaultDecimalsForNetwork(networkId)
                          )
                        : 0;
                    parentMarket[0].gameId = parentMarketData.gameId;

                    // Child Markets contract odds
                    for (let i = 0; i < parentMarket[0].childMarkets.length; i++) {
                        const marketDataOfChildMarket = await sportPositionalMarketDataContract?.getMarketData(
                            parentMarket[0].childMarkets[i].address
                        );

                        marketDataOfChildMarket.odds[0]
                            ? (parentMarket[0].childMarkets[i].homeOdds = bigNumberFormmaterWithDecimals(
                                  marketDataOfChildMarket.odds[0],
                                  getDefaultDecimalsForNetwork(networkId)
                              ))
                            : 0;
                        marketDataOfChildMarket.odds[1]
                            ? (parentMarket[0].childMarkets[i].awayOdds = bigNumberFormmaterWithDecimals(
                                  marketDataOfChildMarket.odds[1],
                                  getDefaultDecimalsForNetwork(networkId)
                              ))
                            : 0;
                        marketDataOfChildMarket.odds[2]
                            ? (parentMarket[0].childMarkets[i].drawOdds = bigNumberFormmaterWithDecimals(
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
                            parentMarket,
                            combinedMarketsContractData
                        );

                        return modifiedMarkets[0];
                    }

                    return parentMarket[0];
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
