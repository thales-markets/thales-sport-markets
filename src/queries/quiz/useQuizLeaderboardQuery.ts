import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import axios from 'axios';
import { LeaderboardByWeeks } from 'types/quiz';
import { LEADERBOARD_ALL_TIME_PATH, LEADERBOARD_PATH, MAX_TRIVA_WEEKS, QUIZ_API_URL } from 'constants/quiz';

const useQuizLeaderboardQuery = (options?: UseQueryOptions<LeaderboardByWeeks>) => {
    return useQuery<LeaderboardByWeeks>(
        QUERY_KEYS.Quiz.Leaderboard(),
        async () => {
            try {
                const leaderboardByWeeksResponse = await axios.get(`${QUIZ_API_URL}${LEADERBOARD_PATH}`);
                const dataByWeeks = leaderboardByWeeksResponse.data.data.slice(0, MAX_TRIVA_WEEKS);

                const allTimeLeaderboardResponse = await axios.get(`${QUIZ_API_URL}${LEADERBOARD_ALL_TIME_PATH}`);
                const dataAllTime = allTimeLeaderboardResponse.data.data;

                const leaderboardData: LeaderboardByWeeks = [
                    ...dataByWeeks,
                    {
                        week: MAX_TRIVA_WEEKS,
                        weekStart: 0,
                        weekEnd: 0,
                        leaderboard: dataAllTime,
                    },
                ];

                return leaderboardData;
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
