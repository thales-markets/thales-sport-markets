import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { OverdropUserData } from 'types/overdrop';

const useUserDataQuery = (walletAddress: string, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<OverdropUserData>({
        queryKey: QUERY_KEYS.Overdrop.UserData(walletAddress),
        queryFn: async () => {
            try {
                const response = await axios.get(`${generalConfig.OVERDROP_API_URL}/user/${walletAddress}`);

                if (response?.status === 200 && response?.data) return response.data;
                return;
            } catch (e) {
                console.error(e);
                return;
            }
        },
        ...options,
    });
};

export default useUserDataQuery;
