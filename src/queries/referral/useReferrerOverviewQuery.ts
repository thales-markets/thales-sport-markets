import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { NetworkId } from 'types/network';
import { Referrer } from 'types/referral';
import thalesData from 'thales-data';

const useReferrerOverviewQuery = (
    referrer: string,
    networkId: NetworkId,
    options?: UseQueryOptions<Referrer | null>
) => {
    return useQuery<Referrer | null>(
        QUERY_KEYS.ReferralOverview(referrer, networkId),
        async () => {
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
        {
            ...options,
        }
    );
};

export default useReferrerOverviewQuery;
