import QUERY_KEYS from 'constants/queryKeys';
import { SPORTS_MAP } from 'constants/tags';
import { useQuery, UseQueryOptions } from 'react-query';
import { SportMarketLiveResult } from 'types/markets';

const useJsonOddsAdditionalDataQuery = (
    marketId: string,
    sportTag: number,
    options?: UseQueryOptions<SportMarketLiveResult | undefined>
) => {
    return useQuery<SportMarketLiveResult | undefined>(
        QUERY_KEYS.JsonOddsData(marketId, sportTag),
        async () => {
            const sportParameter = SPORTS_MAP[sportTag].toLowerCase();
            try {
                const response = await fetch(`https://api.thalesmarket.io/json-odds-data/${sportParameter}`);
                const events = Object.values(JSON.parse(await response.text()));
                console.log(events);

                // const finalResult: SportMarketLiveResult = {
                //     homeScore,
                //     awayScore,
                //     period,
                //     status,
                //     scoreHomeByPeriod,
                //     scoreAwayByPeriod,
                //     displayClock,
                //     sportId,
                //     tournamentName: sportTag == 9033 || sportTag == 9050 ? '' : tournamentName,
                //     tournamentRound: sportTag == 9033 || sportTag == 9050 ? '' : tournamentRound,
                // };
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

export default useJsonOddsAdditionalDataQuery;
