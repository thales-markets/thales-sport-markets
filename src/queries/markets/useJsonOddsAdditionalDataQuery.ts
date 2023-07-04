import QUERY_KEYS from 'constants/queryKeys';
import { SPORTS_MAP } from 'constants/tags';
import { useQuery, UseQueryOptions } from 'react-query';

const useJsonOddsAdditionalDataQuery = (
    marketId: string,
    sportTag: number,
    options?: UseQueryOptions<string | undefined>
) => {
    return useQuery<string | undefined>(
        QUERY_KEYS.JsonOddsData(marketId, sportTag),
        async () => {
            const sportParameter = SPORTS_MAP[sportTag].toLowerCase();
            try {
                const response = await fetch(`https://api.thalesmarket.io/json-odds-data/${sportParameter}`);
                const events = Object.values(JSON.parse(await response.text()));
                const eventTournamentName = (events.find(
                    (event: any) => event.ID.toLowerCase().replaceAll('-', '') == marketId.toLowerCase()
                ) as any).DisplayLeague;
                return eventTournamentName;
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
