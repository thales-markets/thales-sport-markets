import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import thalesData from 'thales-data';
import { Referrer } from 'types/referral';

const useReferrersQuery = (
    networkId: Network,
    orderBy?: string,
    orderDirection?: 'asc' | 'desc',
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Referrer[] | null>({
        queryKey: QUERY_KEYS.Referrers(networkId),
        queryFn: async () => {
            try {
                const referrers: Referrer[] = await thalesData.sportMarkets.referrers({
                    network: networkId,
                    orderBy: orderBy ? orderBy : undefined,
                    orderDirection: orderDirection ? orderDirection : undefined,
                });

                return referrers;
            } catch (e) {
                console.log('E ', e);
                return null;
            }
        },

        ...options,
    });
};

export default useReferrersQuery;
