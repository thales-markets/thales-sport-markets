import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { ParlayMarket } from 'types/markets';
import { NetworkId } from 'types/network';
import thalesData from 'thales-data';

export const useParlayMarketsQuery = (
    account: string,
    networkId: NetworkId,
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
                return parlayMarkets;
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
