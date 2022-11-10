import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { NetworkId } from 'types/network';
import { ReferredTrader } from 'types/referral';
import thalesData from 'thales-data';

const useReferredTradersQuery = (
    networkId: NetworkId,
    referrer?: string,
    orderBy?: string,
    orderDirection?: 'asc' | 'desc',
    options?: UseQueryOptions<ReferredTrader[] | null>
) => {
    return useQuery<ReferredTrader[] | null>(
        QUERY_KEYS.ReferredTraders(referrer || '', networkId),
        async () => {
            try {
                const referredTraders: ReferredTrader[] = await thalesData.sportMarkets.referredTraders({
                    network: networkId,
                    referrer,
                    orderBy,
                    orderDirection,
                });

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
