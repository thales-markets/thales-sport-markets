import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import thalesData from 'thales-data';
import { ReferralTransaction } from 'types/referral';

const useReferralTransactionsQuery = (
    networkId: Network,
    referrer?: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<ReferralTransaction[] | null>({
        queryKey: QUERY_KEYS.ReferralTransaction(referrer || '', networkId),
        queryFn: async () => {
            try {
                const referralTransactions: ReferralTransaction[] = thalesData.sportMarkets.referralTransactions({
                    network: networkId,
                    referrer,
                });
                return referralTransactions;
            } catch (e) {
                console.log('E ', e);
                return null;
            }
        },

        ...options,
    });
};

export default useReferralTransactionsQuery;
