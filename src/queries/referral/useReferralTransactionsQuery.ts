import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { Network } from 'enums/network';
import { ReferralTransaction } from 'types/referral';
import thalesData from 'thales-data';

const useReferralTransactionsQuery = (
    networkId: Network,
    referrer?: string,
    options?: UseQueryOptions<ReferralTransaction[] | null>
) => {
    return useQuery<ReferralTransaction[] | null>(
        QUERY_KEYS.ReferralTransaction(referrer || '', networkId),
        async () => {
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
        {
            ...options,
        }
    );
};

export default useReferralTransactionsQuery;
