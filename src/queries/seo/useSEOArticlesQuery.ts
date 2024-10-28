import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { SEOItem } from 'types/ui';

export const useSEOArticlesQuery = (branchName: string, options?: UseQueryOptions<SEOItem[]>) => {
    return useQuery<SEOItem[]>(
        QUERY_KEYS.SeoArticles(branchName),
        async () => {
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
        {
            ...options,
        }
    );
};
