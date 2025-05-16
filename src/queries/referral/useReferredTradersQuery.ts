import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import thalesData from 'thales-data';
import { ReferredTrader } from 'types/referral';

const useReferredTradersQuery = (
    networkId: Network,
    referrer?: string,
    orderBy?: string,
    orderDirection?: 'asc' | 'desc',
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<ReferredTrader[] | null>({
        queryKey: QUERY_KEYS.ReferredTraders(referrer || '', networkId),
        queryFn: async () => {
            try {
                const referredTraders: ReferredTrader[] = await thalesData.sportMarkets.referredTraders({
                    network: networkId,
                    referrer,
                    orderBy,
                    orderDirection,
                });

                return referredTraders;
            } catch (e) {
                console.log('E ', e);
                return null;
            }
        },

        ...options,
    });
};

export default useReferredTradersQuery;
