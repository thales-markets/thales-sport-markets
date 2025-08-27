import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { CountPerTag } from 'types/markets';

const useCountPerTagQuery = (networkId: Network, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<CountPerTag | undefined>({
        queryKey: QUERY_KEYS.SportMarketsCount(networkId),
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/markets/count-per-tag`,
                    noCacheConfig
                );
                const data = response.data;

                return data;
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        ...options,
    });
};

export default useCountPerTagQuery;
