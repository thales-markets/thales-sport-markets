import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { OverdropXPHistory } from 'types/overdrop';

const useUserXPHistoryQuery = (walletAddress: string, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<OverdropXPHistory[]>({
        queryKey: QUERY_KEYS.Overdrop.UserXPHistory(walletAddress),
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.OVERDROP_API_URL}/user-points-history/${walletAddress}`
                );

                if (response?.data) return response.data;
                return [];
            } catch (e) {
                console.error(e);
                return [];
            }
        },
        ...options,
    });
};

export default useUserXPHistoryQuery;
