import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { FreeBet } from 'types/freeBet';

const useGetFreeBetQuery = (
    freeBetId: string,
    networkId: Network,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<FreeBet | null>({
        queryKey: QUERY_KEYS.FreeBet(freeBetId, networkId),
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/get-free-bet/${freeBetId}`
                );

                if (response?.status === 200 && response?.data) return response.data;
                return null;
            } catch (e) {
                console.error(e);
                return null;
            }
        },
        ...options,
    });
};

export default useGetFreeBetQuery;
