import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { ParlayMarket, SportMarketInfo } from 'types/markets';
import { getIsOneSideMarket, updateTotalQuoteAndAmountFromContract } from 'utils/markets';

export const useMarketParlaysQuery = (
    market: SportMarketInfo,
    networkId: Network,
    options?: UseQueryOptions<ParlayMarket[] | undefined>
) => {
    return useQuery<ParlayMarket[] | undefined>(
        QUERY_KEYS.MarketParlays(networkId, market.address),
        async () => {
            try {
                if (!market) return undefined;

                const marketAddresses = [
                    market.address,
                    ...market.childMarkets.map((childMarket) => childMarket.address),
                ];
                const parlayMarkets = await thalesData.sportMarkets.parlayMarkets({
                    sportMarketsAddresses: marketAddresses,
                    network: networkId,
                });

                const parlayMarketsModified = parlayMarkets.map((parlayMarket: ParlayMarket) => {
                    return {
                        ...parlayMarket,
                        sportMarkets: parlayMarket.sportMarkets.map((market) => {
                            return {
                                ...market,
                                isOneSideMarket: getIsOneSideMarket(Number(market.tags[0])),
                            };
                        }),
                    };
                });

                const updateParlayWithContractData = updateTotalQuoteAndAmountFromContract(parlayMarketsModified);
                return updateParlayWithContractData;
            } catch (e) {
                console.log('E ', e);
                return undefined;
            }
        },
        {
            ...options,
        }
    );
};
