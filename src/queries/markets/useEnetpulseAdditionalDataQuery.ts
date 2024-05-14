import { ENETPULSE_ROUNDS } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { SPORT_ID_MAP_ENETPULSE } from 'constants/sports';
import { League, Sport } from 'enums/sports';
import { UseQueryOptions, useQuery } from 'react-query';
import { SportMarketLiveResult } from 'types/markets';
import { getLeagueSport } from '../../utils/sports';

const useEnetpulseAdditionalDataQuery = (
    marketId: string,
    gameDate: string,
    sportTag: number,
    options?: UseQueryOptions<SportMarketLiveResult | undefined>
) => {
    return useQuery<SportMarketLiveResult | undefined>(
        QUERY_KEYS.EnetpulseLiveResult(marketId, gameDate, sportTag),
        async () => {
            const sportParameter = sportTag;
            const enetpulseSportParameter = SPORT_ID_MAP_ENETPULSE[sportParameter];
            try {
                const response = await fetch(
                    `https://api.thalesmarket.io/enetpulse-result/${enetpulseSportParameter}/${gameDate}`
                );
                const events = Object.values(JSON.parse(await response.text()).events);
                const leagueSport = getLeagueSport(Number(sportTag));

                const event =
                    leagueSport === Sport.MOTOSPORT
                        ? events[0]
                        : (events.find((sportEvent: any) => sportEvent.id == marketId) as any);
                if (event) {
                    const tournamentName = event.tournament_stage_name;
                    const tournamentRound = ENETPULSE_ROUNDS[Number(event.round_typeFK)];
                    const eventParticipants: any[] =
                        leagueSport === Sport.MOTOSPORT ? [] : Object.values(event.event_participants);
                    const homeResults: any[] = [];
                    const awayResults: any[] = [];

                    if (
                        leagueSport !== Sport.ESPORTS &&
                        leagueSport !== Sport.SOCCER &&
                        leagueSport !== Sport.MOTOSPORT
                    ) {
                        homeResults.push(...Object.values(eventParticipants[0].result));
                        awayResults.push(...Object.values(eventParticipants[1].result));
                    }

                    let homeScore = 0;
                    let awayScore = 0;
                    const scoreHomeByPeriod = [];
                    const scoreAwayByPeriod = [];
                    if (leagueSport === Sport.TENNIS) {
                        homeScore = homeResults.find((result) => result.result_code.toLowerCase() == 'setswon').value;
                        awayScore = awayResults.find((result) => result.result_code.toLowerCase() == 'setswon').value;

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
                    }

                    const period = 0;
                    const status = 'finished';
                    const displayClock = '0';
                    const sportId = sportTag;

                    const finalResult: SportMarketLiveResult = {
                        homeScore,
                        awayScore,
                        period,
                        status,
                        scoreHomeByPeriod,
                        scoreAwayByPeriod,
                        displayClock,
                        sportId,
                        tournamentName:
                            sportTag == League.IIHF_WORLD_CHAMPIONSHIP ||
                            sportTag == League.UEFA_EURO_QUALIFICATIONS ||
                            sportTag == League.CONMEBOL_WC_QUALIFICATIONS
                                ? ''
                                : tournamentName,
                        tournamentRound:
                            sportTag == League.IIHF_WORLD_CHAMPIONSHIP ||
                            sportTag == League.UEFA_EURO_QUALIFICATIONS ||
                            sportTag == League.CONMEBOL_WC_QUALIFICATIONS
                                ? ''
                                : tournamentRound,
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

export default useEnetpulseAdditionalDataQuery;
