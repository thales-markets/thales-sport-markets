import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { UseQueryOptions, useQuery } from 'react-query';
import { SportMarketScore } from 'types/markets';

const useSportMarketLiveScoreQuery = (gameId: string, options?: UseQueryOptions<SportMarketScore | undefined>) => {
    return useQuery<SportMarketScore | undefined>(
        QUERY_KEYS.LiveScore(gameId),
        async () => {
            try {
                const liveScoresResponse = await axios(
                    `${generalConfig.API_URL}/overtime-v2/live-scores`,
                    noCacheConfig
                );
                const liveScoresResponseData = liveScoresResponse.data;

                const gameLiveScore = liveScoresResponseData[gameId];

                if (gameLiveScore) {
                    return {
                        period: gameLiveScore.period,
                        gameStatus: gameLiveScore.status,
                        displayClock: gameLiveScore.displayClock,
                        homeScore: gameLiveScore.homeScore,
                        awayScore: gameLiveScore.awayScore,
                        homeScoreByPeriod: gameLiveScore.homeScoreByPeriod,
                        awayScoreByPeriod: gameLiveScore.awayScoreByPeriod,
                    };
                }
            } catch (e) {
                console.log(e);
            }
            return undefined;
        },
        {
            refetchInterval: 10 * 1000,
            ...options,
        }
    );
};

export default useSportMarketLiveScoreQuery;
