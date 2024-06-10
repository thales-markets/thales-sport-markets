import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { ParlayMarket } from 'types/markets';
import { getIsOneSideMarket, updateTotalQuoteAndAmountFromContract } from 'utils/markets';

export const useParlayMarketsQuery = (
    account: string,
    networkId: Network,
    minTimestamp?: number,
    maxTimestamp?: number,
    options?: UseQueryOptions<ParlayMarket[] | undefined>
) => {
    return useQuery<ParlayMarket[] | undefined>(
        QUERY_KEYS.ParlayMarkets(networkId, account, minTimestamp, maxTimestamp),
        async () => {
            try {
                const parlaysRequest = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.Parlays}/${networkId}?account=${account}&${
                        minTimestamp ? `min-timestamp=${minTimestamp}&` : ''
                    }${maxTimestamp ? `max-timestamp=${maxTimestamp}` : ''}
                `
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
