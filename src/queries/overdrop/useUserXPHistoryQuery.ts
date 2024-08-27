import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { OverdropXPHistory } from 'types/overdrop';

const useUserXPHistoryQuery = (walletAddress: string, options?: UseQueryOptions<OverdropXPHistory[]>) => {
    return useQuery<OverdropXPHistory[]>(
        QUERY_KEYS.Overdrop.UserXPHistory(walletAddress),
        async () => {
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
        {
            ...options,
        }
    );
};

export default useUserXPHistoryQuery;
