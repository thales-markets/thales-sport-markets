import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { PromotionItem } from 'types/ui';

export const usePromotionsQuery = (
    branchName: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<PromotionItem[]>({
        queryKey: QUERY_KEYS.Promotions(branchName),
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/v1/sport-markets/promotions/list?branch-name=${
                        branchName ? branchName : 'dev'
                    }`
                );

                if (!response.data) return [];

                return response.data;
            } catch (e) {
                console.log('error', e);
                return [];
            }
        },
        ...options,
    });
};
