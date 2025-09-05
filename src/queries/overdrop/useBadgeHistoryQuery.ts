import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'utils/clientTotp';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';

type MonthlyBadge = {
    address: string;
    month: number;
    year: number;
    points: number;
    volume: number;
    rewards: {
        eth: number;
    };
};

type BadgeHistoryResponse = {
    history: MonthlyBadge[];
    badges: Record<string, number>;
};

const useBadgeHistoryQuery = (walletAddress: string, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<BadgeHistoryResponse>({
        queryKey: QUERY_KEYS.Overdrop.BadgeHistory(walletAddress),
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.OVERDROP_API_URL}/get-badge-history/${walletAddress}`
                );

                if (response?.status === 200 && response?.data) {
                    return response.data;
                }
                return null;
            } catch (e) {
                console.error(e);
                return null;
            }
        },
        ...options,
    });
};

export default useBadgeHistoryQuery;
