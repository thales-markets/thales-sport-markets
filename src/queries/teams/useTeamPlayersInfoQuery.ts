import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { TeamPlayersData } from 'types/markets';
import { NetworkConfig } from 'types/network';

const useTeamPlayersInfoQuery = (
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<TeamPlayersData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<TeamPlayersData>({
        queryKey: QUERY_KEYS.TeamPlayers(networkConfig.networkId),
        queryFn: async () => {
            let teamPlayersData: TeamPlayersData = new Map();

            try {
                const teamPlayersResponse = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkConfig.networkId}/team-players-info`,
                    noCacheConfig
                );
                teamPlayersData = new Map(teamPlayersResponse.data);
            } catch (e) {
                console.log(e);
            }
            return teamPlayersData;
        },
        ...options,
    });
};

export default useTeamPlayersInfoQuery;
