import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { SportMarketLiveResult } from 'types/markets';

const useEnetpulseSportMarketLiveResultQuery = (
    marketId: string,
    gameDate: string,
    sportTag: number,
    options?: UseQueryOptions<SportMarketLiveResult | undefined>
) => {
    return useQuery<SportMarketLiveResult | undefined>(
        QUERY_KEYS.EnetpulseLiveResult(marketId, gameDate, sportTag),
        async () => {
            const sportParameter = sportTag - 9000;

            try {
                const response = await fetch(
                    `https://api.thalesmarket.io/enetpulse-result/${sportParameter}/${gameDate}`
                );
                const events = Object.values(JSON.parse(await response.text()).events);

                let trimmedMarketId = '';
                for (let i = 0; i < marketId.length; i++) {
                    if (!Number.isNaN(Number(marketId[i]))) {
                        trimmedMarketId = trimmedMarketId.concat(marketId[i]);
                    }
                }

                const event = events.find((sportEvent: any) => sportEvent.id == trimmedMarketId) as any;
                if (event) {
                    const tournamentName = event ? event.tournament_stage_name : '';
                    const eventParticipants: any[] = Object.values(event.event_participants);
                    const homeResults: any[] = Object.values(eventParticipants[0].result);
                    const awayResults: any[] = Object.values(eventParticipants[1].result);

                    const homeScore = homeResults.find((result) => result.result_code.toLowerCase() == 'setswon').value;
                    const awayScore = awayResults.find((result) => result.result_code.toLowerCase() == 'setswon').value;

                    const scoreHomeByPeriod = [];
                    const scoreAwayByPeriod = [];

                    for (let i = 1; i <= 5; i++) {
                        const homeSetResult = homeResults.find(
                            (result) => result.result_code.toLowerCase() == 'set' + i
                        );
                        if (homeSetResult) {
                            scoreHomeByPeriod.push(homeSetResult.value);
                        }

                        const awaySetResult = awayResults.find(
                            (result) => result.result_code.toLowerCase() == 'set' + i
                        );
                        if (awaySetResult) {
                            scoreAwayByPeriod.push(awaySetResult.value);
                        }
                    }
                    const period = 0;
                    const status = 'finished';
                    const displayClock = '0';
                    const sportId = sportParameter;

                    const finalResult: SportMarketLiveResult = {
                        homeScore,
                        awayScore,
                        period,
                        status,
                        scoreHomeByPeriod,
                        scoreAwayByPeriod,
                        displayClock,
                        sportId,
                        tournamentName,
                    };
                    return finalResult;
                }

                return undefined;
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            ...options,
        }
    );
};

export default useEnetpulseSportMarketLiveResultQuery;
