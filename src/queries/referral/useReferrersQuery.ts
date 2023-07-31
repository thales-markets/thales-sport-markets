import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { Network } from 'enums/network';
import { Referrer } from 'types/referral';
import thalesData from 'thales-data';

const useReferrersQuery = (
    networkId: Network,
    orderBy?: string,
    orderDirection?: 'asc' | 'desc',
    options?: UseQueryOptions<Referrer[] | null>
) => {
    return useQuery<Referrer[] | null>(
        QUERY_KEYS.Referrers(networkId),
        async () => {
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
        {
            ...options,
        }
    );
};

export default useReferrersQuery;
