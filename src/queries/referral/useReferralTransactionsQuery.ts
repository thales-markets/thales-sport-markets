import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { ReferralTransaction } from 'types/referral';

const useReferralTransactionsQuery = (
    networkId: Network,
    referrer?: string,
    options?: UseQueryOptions<ReferralTransaction[] | null>
) => {
    return useQuery<ReferralTransaction[] | null>(
        QUERY_KEYS.ReferralTransaction(referrer || '', networkId),
        async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.ReferralTransactions}/${networkId}?referrer=${
                        referrer ? referrer : ''
                    }`
                );
                const referralTransactions: ReferralTransaction[] = response?.data ? response.data : [];
                return referralTransactions;
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

export default useReferralTransactionsQuery;
