import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import axios from 'axios';
import { TWEET_PATH, QUIZ_API_URL } from 'constants/quiz';
import { LINKS } from 'constants/links';

const useQuizTweetQuery = (options?: UseQueryOptions<string>) => {
    return useQuery<string>(
        QUERY_KEYS.Quiz.Tweet(),
        async () => {
            try {
                const tweetResponse = await axios.get(`${QUIZ_API_URL}${TWEET_PATH}`);
                const data = tweetResponse.data.data;
                return data;
            } catch (e) {
                console.log(e);
            }
            return LINKS.Twitter;
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useQuizTweetQuery;
