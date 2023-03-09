import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { NetworkId } from 'types/network';

type LeaderboardByGuessedCorrectlyResponse = {
    walletAddress: string;
    baseVolume: number;
    bonusVolume: number;
    totalCorrectedPredictions: number;
    rank: number;
    rewards: number;
}[];

const useLoeaderboardByGuessedCorrectlyQuery = (
    networkId: NetworkId,
    options?: UseQueryOptions<LeaderboardByGuessedCorrectlyResponse | undefined>
) => {
    return useQuery<LeaderboardByGuessedCorrectlyResponse | undefined>(
        QUERY_KEYS.MarchMadnessCompetition.LeaderboardByNumberOfCorrectPredictions(networkId),
        async () => {
            try {
                const rawResponse = await fetch(`https://api.thalesmarket.io/march-madness/1/${networkId}`);
                const response = JSON.parse(await rawResponse.text());

                console.log('Response ', response);

                return response;
            } catch (e) {
                console.log('E ', e);
                return;
            }
        },
        {
            ...options,
        }
    );
};

export default useLoeaderboardByGuessedCorrectlyQuery;
