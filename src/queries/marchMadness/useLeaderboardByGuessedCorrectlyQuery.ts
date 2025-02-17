import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'thales-utils';

export type LeaderboardByGuessedCorrectlyResponse = {
    owner: string;
    totalPoints: number;
    bracketId: number;
    rank: number;
    tokenRewards: number;
    stableRewards: number;
}[];

const useLeaderboardByGuessedCorrectlyQuery = (
    networkId: NetworkId,
    options?: Omit<UseQueryOptions<LeaderboardByGuessedCorrectlyResponse | null>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LeaderboardByGuessedCorrectlyResponse | null>({
        queryKey: QUERY_KEYS.MarchMadness.Competition.LeaderboardByNumberOfCorrectPredictions(networkId),
        queryFn: async () => {
            try {
                const rawResponse = await fetch(`${generalConfig.API_URL}/march-madness/${networkId}`);
                const response = JSON.parse(await rawResponse.text());
                return response.dataByPoints;
            } catch (e) {
                console.log('E ', e);
                return null;
            }
        },
        ...options,
    });
};

export default useLeaderboardByGuessedCorrectlyQuery;
