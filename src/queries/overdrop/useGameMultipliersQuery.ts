import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { GameMultiplier } from 'types/overdrop';

const useGameMultipliersQuery = (options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<GameMultiplier[]>({
        queryKey: QUERY_KEYS.Overdrop.GameMultipliers(),
        queryFn: async () => {
            try {
                const response = await axios.get(`${generalConfig.OVERDROP_API_URL}/game-multipliers`);

                if (response?.data) return response.data;
                return [];
            } catch (e) {
                console.error(e);
                return [];
            }
        },
        ...options,
    });
};

export default useGameMultipliersQuery;
