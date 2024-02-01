import axios from 'axios';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { PromotionItem } from 'types/ui';

export const usePromotionsQuery = (branchName: string, options?: UseQueryOptions<PromotionItem[]>) => {
    return useQuery<PromotionItem[]>(
        QUERY_KEYS.Promotions(branchName),
        async () => {
            try {
                const response = await axios.get(
                    `https://raw.githubusercontent.com/thales-markets/thales-sport-markets/${
                        branchName ? branchName : 'main'
                    }/src/assets/promotions/index.json`
                );

                if (!response.data) return [];

                return response.data;
            } catch (e) {
                console.log('error', e);
                return [];
            }
        },
        {
            ...options,
        }
    );
};
