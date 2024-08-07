import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { OverdropUserData } from 'types/overdrop';

const useUserDataQuery = (walletAddress: string, options?: UseQueryOptions<OverdropUserData>) => {
    return useQuery<OverdropUserData>(
        QUERY_KEYS.Overdrop.UserData(walletAddress),
        async () => {
            try {
                const response = await axios.get(`${generalConfig.OVERDROP_API_URL}/user/${walletAddress}`);

                if (response?.data) return response.data;
                return;
            } catch (e) {
                console.error(e);
                return;
            }
        },
        {
            ...options,
        }
    );
};

export default useUserDataQuery;
