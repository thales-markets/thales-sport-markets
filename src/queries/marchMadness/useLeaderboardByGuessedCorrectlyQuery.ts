import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { isTestNetwork } from 'utils/network';

export type LeaderboardByGuessedCorrectlyResponse = {
    owner: string;
    totalPoints: number;
    bracketId: number;
    bracketWinnerTeamId: number;
    rank: number;
    tokenRewards: number;
    stableRewards: number;
    network: number;
}[];

const useLeaderboardByGuessedCorrectlyQuery = (
    networkId: SupportedNetwork,
    options?: Omit<UseQueryOptions<LeaderboardByGuessedCorrectlyResponse | null>, 'queryKey' | 'queryFn'>
) => {
    // rewards are cross chain, so fetch from any one
    const useNetworkId = isTestNetwork(networkId) ? NetworkId.OptimismSepolia : NetworkId.OptimismMainnet;

    return useQuery<LeaderboardByGuessedCorrectlyResponse | null>({
        queryKey: QUERY_KEYS.MarchMadness.Competition.LeaderboardByNumberOfCorrectPredictions(useNetworkId),
        queryFn: async () => {
            try {
                const rawResponse = await fetch(`${generalConfig.API_URL}/march-madness/${useNetworkId}`);
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
