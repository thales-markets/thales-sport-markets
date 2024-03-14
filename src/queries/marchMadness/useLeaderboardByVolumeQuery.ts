import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { NetworkId } from 'thales-utils';

export type LeaderboardByVolumeData = {
    walletAddress: string;
    volume: number;
    rank: number;
    estimatedRewards: number;
}[];

const useLeaderboardByVolumeQuery = (
    networkId: NetworkId,
    options?: UseQueryOptions<LeaderboardByVolumeData | undefined>
) => {
    return useQuery<LeaderboardByVolumeData | undefined>(
        QUERY_KEYS.MarchMadness.Competition.LeaderboardByVolume(networkId),
        async () => {
            try {
                const rawResponse = await fetch(`https://api.thalesmarket.io/march-madness/${networkId}`);
                const response = JSON.parse(await rawResponse.text());

                return response.dataByVolume;
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
