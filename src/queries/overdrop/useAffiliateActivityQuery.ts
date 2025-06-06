import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';

const useAffiliateActivityQuery = (
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<any[]>({
        queryKey: QUERY_KEYS.Overdrop.AffiliateActivity(walletAddress),
        queryFn: async () => {
            try {
                const response = await axios.get(`${generalConfig.OVERDROP_API_URL}/affiliate-bets/${walletAddress}`);
                if (response?.status === 200 && response?.data) return response.data;
                return [];
            } catch (e) {
                console.error(e);
                return [];
            }
        },
        ...options,
    });
};

export default useAffiliateActivityQuery;
