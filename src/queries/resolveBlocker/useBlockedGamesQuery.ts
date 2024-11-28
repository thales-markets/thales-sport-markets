import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import { SupportedNetwork } from 'types/network';
import { BlockedGame, BlockedGames } from 'types/resolveBlocker';
import networkConnector from 'utils/networkConnector';
import { Team } from '../../types/markets';

const useBlockedGamesQuery = (
    isUnblocked: boolean,
    networkId: SupportedNetwork,
    options?: UseQueryOptions<BlockedGames>
) => {
    return useQuery<BlockedGames>(
        QUERY_KEYS.ResolveBlocker.BlockedGames(isUnblocked, networkId),
        async () => {
            const { resolveBlockerContract } = networkConnector;
            if (resolveBlockerContract) {
                const [gamesInfoResponse, blockedGames] = await Promise.all([
                    axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                    thalesData.sportMarketsV2.blockedGames({
                        network: networkId,
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
        {
            ...options,
        }
    );
};

export default useBlockedGamesQuery;
