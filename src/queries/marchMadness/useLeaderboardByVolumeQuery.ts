import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'thales-utils';

export type LeaderboardByVolumeData = {
    walletAddress: string;
    volume: number;
    rank: number;
    estimatedRewards: number;
}[];

const useLeaderboardByVolumeQuery = (
    networkId: NetworkId,
    options?: Omit<UseQueryOptions<LeaderboardByVolumeData | null>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LeaderboardByVolumeData | null>({
        queryKey: QUERY_KEYS.MarchMadness.Competition.LeaderboardByVolume(networkId),
        queryFn: async () => {
            try {
                const rawResponse = await fetch(`${generalConfig.API_URL}/march-madness/${networkId}`);
                const response = JSON.parse(await rawResponse.text());

                return response.dataByVolume;
            } catch (e) {
                console.log('E ', e);
                return null;
            }
        },
        ...options,
    });
};

export default useLeaderboardByVolumeQuery;
