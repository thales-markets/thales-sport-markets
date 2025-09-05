import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'utils/clientTotp';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { minutesToMilliseconds } from 'date-fns';
import { Network } from 'enums/network';
import { GamesCount } from 'types/markets';

const useGamesCountQuery = (
    networkId: Network,
    options?: Omit<UseQueryOptions<GamesCount | null>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<GamesCount | null>({
        queryKey: QUERY_KEYS.GamesCount(networkId),
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/games-count`,
                    noCacheConfig
                );
                const data = response.data;

                return data;
            } catch (e) {
                console.log(e);
                return null;
            }
        },
        refetchInterval: minutesToMilliseconds(5),
        ...options,
    });
};

export default useGamesCountQuery;
