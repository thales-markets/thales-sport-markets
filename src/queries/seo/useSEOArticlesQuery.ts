import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { SEOItem } from 'types/ui';

export const useSEOArticlesQuery = (
    branchName: string,
    options?: Omit<UseQueryOptions<SEOItem[]>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<SEOItem[]>({
        queryKey: QUERY_KEYS.SeoArticles(branchName),
        queryFn: async () => {
            try {
                const response = await axios.get(
                    `${generalConfig.API_URL}/v1/sport-markets/seo-articles/list?branch-name=${
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
