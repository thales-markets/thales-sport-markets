import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { LeaderboardRow } from 'types/overdrop';

const useOverdropLeaderboardQuery = (options?: UseQueryOptions<LeaderboardRow[]>) => {
    return useQuery<LeaderboardRow[]>(
        QUERY_KEYS.Overdrop.Leaderboard(),
        async () => {
            try {
                const response = await axios.get(`${generalConfig.OVERDROP_API_URL}/leaderboard`);

                if (response?.data) return response.data;
            } catch (e) {
                console.error(e);
            }
            return [];
        },
        {
            ...options,
        }
    );
};

export default useOverdropLeaderboardQuery;
