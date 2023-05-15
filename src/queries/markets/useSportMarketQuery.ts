import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { CombinedMarketsContractData, SportMarketInfo } from 'types/markets';
import thalesData from 'thales-data';
import { NetworkId } from 'types/network';
import networkConnector from 'utils/networkConnector';
import { insertCombinedMarketsIntoArrayOFMarkets } from 'utils/combinedMarkets';
import { getMarketAddressesFromSportMarketArray } from 'utils/markets';

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

                const parentMarket = await thalesData.sportMarkets.markets({
                    network: networkId,
                    market: marketAddress,
                });

                const childMarkets = await thalesData.sportMarkets.markets({
                    network: networkId,
                    parentMarket: marketAddress,
                });

                if (parentMarket) {
                    parentMarket[0].childMarkets = childMarkets;
                    const marketAddresses = getMarketAddressesFromSportMarketArray(parentMarket);

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
