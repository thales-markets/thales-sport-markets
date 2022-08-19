import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import axios from 'axios';
import { LeaderboardList } from 'types/quiz';
import { LEADERBOARD_PATH, QUIZ_API_URL } from 'constants/quiz';

const useQuizLeaderboardQuery = (options?: UseQueryOptions<LeaderboardList>) => {
    return useQuery<LeaderboardList>(
        QUERY_KEYS.Quiz.Leaderboard(),
        async () => {
            try {
                const leaderboardResponse = await axios.get(`${QUIZ_API_URL}${LEADERBOARD_PATH}`);

                return leaderboardResponse.data.data;
            } catch (e) {
                console.log(e);
            }
            return [];
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useQuizLeaderboardQuery;
