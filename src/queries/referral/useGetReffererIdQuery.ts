import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';

const useGetReffererIdQuery = (walletAddress: string, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<string>({
        queryKey: QUERY_KEYS.ReferrerID(walletAddress),
        queryFn: async () => {
            try {
                const response = await axios.get(`${generalConfig.API_URL}/get-address-refferer-id/${walletAddress}`);
                return response.data;
            } catch (e) {
                return null;
            }
        },
        ...options,
    });
};

export default useGetReffererIdQuery;
