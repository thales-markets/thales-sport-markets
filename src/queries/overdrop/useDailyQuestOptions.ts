import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { SpinThewheelOption } from 'types/overdrop';

const useDailyQuestOptions = (options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<SpinThewheelOption[]>({
        queryKey: QUERY_KEYS.Overdrop.SpinTheWheel(),
        queryFn: async () => {
            try {
                const response = await axios.get(`${generalConfig.OVERDROP_API_URL}/wheel-rewards`);
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

export default useDailyQuestOptions;
