import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';

type AMMContractsPausedData = { dailymultiplier: number; weeklyMultiplier: number };

const useGetUserMultipliersQuery = (walletAddress: string, options?: UseQueryOptions<AMMContractsPausedData>) => {
    return useQuery<AMMContractsPausedData>(
        QUERY_KEYS.Overdrop.UserMultipliers(walletAddress),
        async () => {
            try {
                const response = await axios.get(`${generalConfig.OVERDROP_API_URL}/user-multipliers/${walletAddress}`);

                return response.data;
            } catch (e) {
                console.log(e);
                return {
                    dailymultiplier: 0,
                    weeklyMultiplier: 0,
                };
            }
        },
        {
            ...options,
        }
    );
};

export default useGetUserMultipliersQuery;
