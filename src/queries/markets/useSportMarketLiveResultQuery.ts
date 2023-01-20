import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { SportMarketLiveResult } from 'types/markets';
// import { ZERO_ADDRESS } from 'constants/network';

const baseUrl = ' https://therundown.io/api/v2/events/';
const queryParamRundownKey = '?key=';

const useSportMarketLiveResultQuery = (
    marketId: string,
    options?: UseQueryOptions<SportMarketLiveResult | undefined>
) => {
    return useQuery<SportMarketLiveResult | undefined>(
        QUERY_KEYS.LiveResult(marketId),
        async () => {
            try {
                const apiKey = process.env.REACT_APP_RUNDOWN_API_KEY || '';
                if (!apiKey) {
                    console.error('Rundown API_KEY not found!');
                    return undefined;
                }

                const rundownUrl = baseUrl + marketId + queryParamRundownKey + apiKey;

                const response = await fetch(rundownUrl);
                const resultData = JSON.parse(await response.text());

                const homeScore = resultData.events[0].score.score_home;
                const awayScore = resultData.events[0].score.score_away;
                const period = resultData.events[0].score.game_period;
                const status = resultData.events[0].score.event_status;
                const scoreHomeByPeriod = resultData.events[0].score.score_home_by_period;
                const scoreAwayByPeriod = resultData.events[0].score.score_away_by_period;
                const displayClock = resultData.events[0].score.display_clock;
                const sportId = resultData.events[0].sport_id + 9000;

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
