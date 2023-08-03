import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { ParlayMarket } from 'types/markets';
import { Network } from 'enums/network';
import { getIsOneSideMarket, updateTotalQuoteAndAmountFromContract } from 'utils/markets';

export const useParlayMarketsQuery = (
    account: string,
    networkId: Network,
    minTimestamp?: number,
    maxTimestamp?: number,
    options?: UseQueryOptions<ParlayMarket[] | undefined>
) => {
    return useQuery<ParlayMarket[] | undefined>(
        QUERY_KEYS.ParlayMarkets(networkId, account),
        async () => {
            try {
                if (!account) return undefined;
                const parlayMarkets = await thalesData.sportMarkets.parlayMarkets({
                    account,
                    network: networkId,
                    maxTimestamp,
                    minTimestamp,
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
