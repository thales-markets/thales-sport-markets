import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { Referrer } from 'types/referral';

const useReferrersQuery = (networkId: Network, options?: UseQueryOptions<Referrer[] | null>) => {
    return useQuery<Referrer[] | null>(
        QUERY_KEYS.Referrers(networkId),
        async () => {
            try {
                const response = await axios.get(`${generalConfig.API_URL}/${API_ROUTES.Referrers}/${networkId}`);
                const referrers: Referrer[] = response?.data ? response.data : [];

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
