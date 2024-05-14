import QUERY_KEYS from 'constants/queryKeys';
import { GOLF_TOURNAMENT_WINNER_TAG } from 'constants/tags';
import { useQuery, UseQueryOptions } from 'react-query';
import { getLeagueSport } from '../../utils/sports';

const useJsonOddsAdditionalDataQuery = (
    marketId: string,
    sportTag: number,
    options?: UseQueryOptions<string | undefined>
) => {
    return useQuery<string | undefined>(
        QUERY_KEYS.JsonOddsData(marketId, sportTag),
        async () => {
            const sportParameter = `${getLeagueSport(sportTag)}`.toLowerCase();
            try {
                const response = await fetch(`https://api.thalesmarket.io/json-odds-data/${sportParameter}`);
                const events = Object.values(JSON.parse(await response.text()));
                if (sportTag == GOLF_TOURNAMENT_WINNER_TAG) {
                    const eventTournamentName = (events.find((event: any) => {
                        const playerObjectsIDs = event.Odds.map((oddsObject: any) =>
                            oddsObject.ID.toString().replaceAll('-', '')
                        );
                        const marketIncluded = playerObjectsIDs.includes(marketId);
                        return event.HomeTeam == null && event.awayTeam == null && marketIncluded;
                    }) as any).DisplayLeague;
                    return eventTournamentName;
                } else {
                    const eventTournamentName = (events.find(
                        (event: any) => event.ID.toLowerCase().replaceAll('-', '') == marketId.toLowerCase()
                    ) as any).DisplayLeague;
                    return eventTournamentName;
                }
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
