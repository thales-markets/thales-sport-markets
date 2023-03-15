import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { NetworkId } from 'types/network';

type LeaderboardByVolumeResponse = {
    globalVolume: number;
    leaderboard: {
        walletAddress: string;
        volume: number;
        baseVolume: number;
        bonusVolume: number;
        totalCorrectedPredictions: number;
        rank: number;
        rewards: string;
    }[];
};

export type LeaderboardByVolumeData = {
    walletAddress: string;
    volume: number;
    baseVolume: number;
    bonusVolume: number;
    totalCorrectedPredictions: number;
    rank: number;
    rewards: string;
}[];

const useLeaderboardByVolumeQuery = (
    networkId: NetworkId,
    options?: UseQueryOptions<LeaderboardByVolumeResponse | undefined>
) => {
    return useQuery<LeaderboardByVolumeResponse | undefined>(
        QUERY_KEYS.MarchMadnessCompetition.LeaderboardByVolume(networkId),
        async () => {
            try {
                const rawResponse = await fetch(`https://api.thalesmarket.io/march-madness/0/${networkId}`);
                const response = JSON.parse(await rawResponse.text());

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

export default useLeaderboardByVolumeQuery;
