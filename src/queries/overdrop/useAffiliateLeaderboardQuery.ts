import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';

const useAffiliateLeaderboardQuery = (options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<any[]>({
        queryKey: QUERY_KEYS.Overdrop.AffiliateLeaderboard(),
        queryFn: async () => {
            try {
                const response = await axios.get(`${generalConfig.OVERDROP_API_URL}/affiliate-leaderboard`);

                if (response?.status === 200 && response?.data)
                    return response.data.map((item: any, index: number) => ({
                        ...item,
                        rank: index + 1,
                    }));
                return [];
            } catch (e) {
                console.error(e);
                return [];
            }
        },
        ...options,
    });
};

export default useAffiliateLeaderboardQuery;
