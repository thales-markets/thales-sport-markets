import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { Referrer } from 'types/referral';

const useReferrerOverviewQuery = (referrer: string, networkId: Network, options?: UseQueryOptions<Referrer | null>) => {
    return useQuery<Referrer | null>(
        QUERY_KEYS.ReferralOverview(referrer, networkId),
        async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.Referrers}/${networkId}?referrer=${referrer ? referrer : ''}`
                );
                const referrers: Referrer[] = response?.data ? response.data : [];

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
