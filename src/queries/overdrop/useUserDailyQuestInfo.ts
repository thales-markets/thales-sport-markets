import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'utils/clientTotp';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { OverdropUserData } from 'types/overdrop';

const useUserDailyQuestInfo = (walletAddress: string, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<OverdropUserData>({
        queryKey: QUERY_KEYS.Overdrop.UserDailyQuestInfo(walletAddress),
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.OVERDROP_API_URL}/user-daily-quest-info/${walletAddress}`
                );
                if (response?.status === 200 && response?.data) return response.data;
                return;
            } catch (e) {
                console.error(e);
                return;
            }
        },
        ...options,
    });
};

export default useUserDailyQuestInfo;
