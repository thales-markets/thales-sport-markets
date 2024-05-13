import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { SportMarketLiveResult } from 'types/markets';
import { TAGS_FLAGS } from '../../enums/tags';

const useSportMarketLiveResultQuery = (
    marketId: string,
    options?: UseQueryOptions<SportMarketLiveResult | undefined>
) => {
    return useQuery<SportMarketLiveResult | undefined>(
        QUERY_KEYS.LiveResult(marketId),
        async () => {
            try {
                const response = await fetch(`https://api.thalesmarket.io/live-result/${marketId}`);
                const resultData = JSON.parse(await response.text());

                let homeScore;
                let awayScore;
                const period = resultData.events[0].score.game_period;
                const status = resultData.events[0].score.event_status;
                const scoreHomeByPeriod = resultData.events[0].score.score_home_by_period;
                const scoreAwayByPeriod = resultData.events[0].score.score_away_by_period;
                const displayClock = resultData.events[0].score.display_clock;
                const sportId = resultData.events[0].sport_id + 9000;

                if (sportId == TAGS_FLAGS.UFC) {
                    let totalHomeScoreInRounds = 0;
                    let totalAwayScoreInRounds = 0;
                    for (let i = 0; i < scoreHomeByPeriod.length; i++) {
                        const homeScoreInRound = scoreHomeByPeriod[i];
                        const awayScoreInRound = scoreAwayByPeriod[i];
                        if (homeScoreInRound > awayScoreInRound) totalHomeScoreInRounds++;
                        if (homeScoreInRound < awayScoreInRound) totalAwayScoreInRounds++;
                    }

                    homeScore = totalHomeScoreInRounds;
                    awayScore = totalAwayScoreInRounds;
                } else {
                    homeScore = resultData.events[0].score.score_home;
                    awayScore = resultData.events[0].score.score_away;
                }

                const liveResult: SportMarketLiveResult = {
                    homeScore,
                    awayScore,
                    period,
                    status,
                    scoreHomeByPeriod,
                    scoreAwayByPeriod,
                    displayClock,
                    sportId,
                };

                return liveResult;
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            refetchInterval: 10 * 1000,
            ...options,
        }
    );
};

export default useSportMarketLiveResultQuery;
