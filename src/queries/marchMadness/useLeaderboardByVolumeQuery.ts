import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { generalConfig } from 'config/general';
import { ARB_VOLUME_REWARDS } from 'constants/marchMadness';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'thales-utils';

type VolumeData = {
    rank: number;
    walletAddress: string;
    volume: number;
    estimatedRewards: number;
};

export type LeaderboardByVolumeData = VolumeData[];

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

                const volumeData = response.dataByVolume.map((data: any) => {
                    const estimatedRewards = (data.volume / data.totalVolume) * ARB_VOLUME_REWARDS;
                    const mappedData: VolumeData = {
                        rank: data.rank,
                        walletAddress: data.wallet,
                        volume: data.volume,
                        estimatedRewards,
                    };
                    return mappedData;
                });

                return volumeData;
            } catch (e) {
                console.log('E ', e);
                return null;
            }
        },
        ...options,
    });
};

export default useLeaderboardByVolumeQuery;
