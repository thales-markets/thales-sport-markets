import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import thalesData from 'thales-data';
import { Referrer } from 'types/referral';

const useReferrerOverviewQuery = (
    referrer: string,
    networkId: Network,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Referrer | null>({
        queryKey: QUERY_KEYS.ReferralOverview(referrer, networkId),
        queryFn: async () => {
            try {
                const referrers: Referrer[] = await thalesData.sportMarkets.referrers({
                    network: networkId,
                    referrer,
                });

                return referrers ? referrers[0] : null;
            } catch (e) {
                console.log('E ', e);
                return null;
            }
        },

        ...options,
    });
};

export default useReferrerOverviewQuery;
