import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';

const useGetIsWhitelistedQuery = (
    walletAddress: string,
    networkId: Network,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<boolean>({
        queryKey: QUERY_KEYS.IsWhitelistedForFreeBets(walletAddress, networkId),
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/is-whitelisted-for-free-bets/${walletAddress}`
                );

                if (response?.status === 200 && response?.data) return response.data;
                return false;
            } catch (e) {
                console.error(e);
                return false;
            }
        },
        ...options,
    });
};

export default useGetIsWhitelistedQuery;
