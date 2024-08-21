import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { GameMultiplier } from 'types/overdrop';

const useGameMultipliersQuery = (options?: UseQueryOptions<GameMultiplier[]>) => {
    return useQuery<GameMultiplier[]>(
        QUERY_KEYS.Overdrop.GameMultipliers(),
        async () => {
            try {
                const response = await axios.get(`${generalConfig.OVERDROP_API_URL}/game-multipliers`);

                if (response?.data) return response.data;
                return [];
            } catch (e) {
                console.error(e);
                return [];
            }
        },
        {
            ...options,
        }
    );
};

export default useGameMultipliersQuery;
