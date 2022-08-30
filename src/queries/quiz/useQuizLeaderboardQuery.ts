import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import axios from 'axios';
import { LeaderboardByWeeks } from 'types/quiz';
import { LEADERBOARD_PATH, QUIZ_API_URL } from 'constants/quiz';

const useQuizLeaderboardQuery = (options?: UseQueryOptions<LeaderboardByWeeks>) => {
    return useQuery<LeaderboardByWeeks>(
        QUERY_KEYS.Quiz.Leaderboard(),
        async () => {
            try {
                const leaderboardResponse = await axios.get(`${QUIZ_API_URL}${LEADERBOARD_PATH}`);
                const data = leaderboardResponse.data.data;
                return data;
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
