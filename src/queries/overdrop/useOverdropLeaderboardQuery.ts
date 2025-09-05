import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'utils/clientTotp';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { LeaderboardRow } from 'types/overdrop';

const useOverdropLeaderboardQuery = (
    season: number,
    miniSeason: number,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LeaderboardRow[]>({
        queryKey: QUERY_KEYS.Overdrop.Leaderboard(season, miniSeason),
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.OVERDROP_API_URL}/leaderboard?season=${season}&miniSeason=${miniSeason}`
                );

                if (response?.status === 200 && response?.data) return response.data;
            } catch (e) {
                console.error(e);
            }
            return [];
        },
        ...options,
    });
};

export default useOverdropLeaderboardQuery;
