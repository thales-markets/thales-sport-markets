import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { OverdropMultiplier } from 'types/overdrop';

const useUserDataQuery = (walletAddress: string, options?: UseQueryOptions<OverdropMultiplier[]>) => {
    return useQuery<OverdropMultiplier[]>(
        QUERY_KEYS.Overdrop.UserMultipliers(walletAddress),
        async () => {
            try {
                const response = await axios.get(`${generalConfig.OVERDROP_API_URL}/user-multipliers/${walletAddress}`);

                return Object.keys(response.data).map((key) => ({ multiplier: response.data[key], name: key }));
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

export default useUserDataQuery;
