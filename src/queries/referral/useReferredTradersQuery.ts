import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { ReferredTrader } from 'types/referral';

const useReferredTradersQuery = (
    networkId: Network,
    referrer?: string,
    options?: UseQueryOptions<ReferredTrader[] | null>
) => {
    return useQuery<ReferredTrader[] | null>(
        QUERY_KEYS.ReferredTraders(referrer || '', networkId),
        async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.ReferralTraders}/${networkId}?referrer=${
                        referrer ? referrer : ''
                    }`
                );
                const referredTraders: ReferredTrader[] = response?.data ? response.data : [];

                return referredTraders;
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

export default useReferredTradersQuery;
