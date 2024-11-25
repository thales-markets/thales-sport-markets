import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { SupportedNetwork } from 'types/network';
import { BlockedGames } from 'types/resolveBlocker';
import networkConnector from 'utils/networkConnector';
import { packMarket } from '../../utils/marketsV2';

const BATCH_SIZE = 10;

const useBlockedGamesQuery = (networkId: SupportedNetwork, options?: UseQueryOptions<BlockedGames>) => {
    return useQuery<BlockedGames>(
        QUERY_KEYS.ResolveBlocker.BlockedGames(networkId),
        async () => {
            const { resolveBlockerContract } = networkConnector;
            if (resolveBlockerContract) {
                const ongoingGamesResponse = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/markets/?status=ongoing&ungroup=true&onlyBasicProperties=true&onlyMainMarkets=true`,
                    noCacheConfig
                );
                const ongoingGames = ongoingGamesResponse.data;
                const ongoingGamesIds = ongoingGames.map((game: any) => game.gameId);

                const numberOfBatches = Math.trunc(ongoingGamesIds.length / BATCH_SIZE) + 1;
                const promises = [];
                for (let i = 0; i < numberOfBatches; i++) {
                    promises.push(
                        resolveBlockerContract.getGamesBlockedForResolution(
                            ongoingGamesIds.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
                        )
                    );
                }

                const promisesResult = await Promise.all(promises);
                // const gamesBlockedForResolution = promisesResult.flat(1);

                const areGamesBlocked: string[] = promisesResult.map((result: any) => result.blockedGames).flat(1);
                const reasons: string[] = promisesResult.map((result: any) => result.blockReason).flat(1);
                const unblockedByAdmin: string[] = promisesResult.map((result: any) => result.unblockedByAdmin).flat(1);

                const blockedGames: BlockedGames = [];
                ongoingGames.forEach((game: any, index: number) => {
                    if (areGamesBlocked[index] && !unblockedByAdmin[index]) {
                        blockedGames.push({
                            game: packMarket(game, undefined, undefined, false),
                            reason: reasons[index],
                            isBlocked: true,
                        });
                    }
                });
                return blockedGames;
            }

            return [];
        },
        {
            ...options,
        }
    );
};

export default useBlockedGamesQuery;
