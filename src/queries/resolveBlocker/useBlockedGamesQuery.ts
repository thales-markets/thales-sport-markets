import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import thalesData from 'thales-data';
import { Team } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { BlockedGame, BlockedGames } from 'types/resolveBlocker';
import { getContractInstance } from 'utils/contract';

const useBlockedGamesQuery = (
    isUnblocked: boolean,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<BlockedGames>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<BlockedGames>({
        queryKey: QUERY_KEYS.ResolveBlocker.BlockedGames(isUnblocked, networkConfig.networkId),
        queryFn: async () => {
            const resolveBlockerContract = getContractInstance(ContractType.RESOLVE_BLOCKER, networkConfig);

            if (resolveBlockerContract) {
                const [gamesInfoResponse, blockedGames] = await Promise.all([
                    axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                    thalesData.sportMarketsV2.blockedGames({
                        network: networkConfig.networkId,
                        isUnblocked,
                    }),
                ]);
                const gamesInfo = gamesInfoResponse.data;

                return blockedGames.map(
                    (game: any): BlockedGame => {
                        const gameInfo = gamesInfo[game.gameId];

                        const homeTeam =
                            !!gameInfo && gameInfo.teams && gameInfo.teams.find((team: Team) => team.isHome);
                        const homeTeamName = homeTeam?.name ?? '';

                        const awayTeam =
                            !!gameInfo && gameInfo.teams && gameInfo.teams.find((team: Team) => !team.isHome);
                        const awayTeamName = awayTeam?.name ?? '';

                        return {
                            ...game,
                            homeTeam: homeTeamName,
                            awayTeam: awayTeamName,
                        };
                    }
                );
            }

            return [];
        },
        ...options,
    });
};

export default useBlockedGamesQuery;
