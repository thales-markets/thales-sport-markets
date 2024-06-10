import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
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

                const parlaysRequest = await axios.get(
                    `${generalConfig.API_URL}/${
                        API_ROUTES.Parlays
                    }/${networkId}?sport-markets-addresses=${marketAddresses.join(',')}`
                );

                const parlayMarkets = parlaysRequest?.data ? parlaysRequest.data : [];

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
