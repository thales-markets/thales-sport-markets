import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { QueryConfig } from 'types/network';

export type Banner = {
    url: string;
    image: string;
};

export const useBannersQuery = (
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Banner[]>({
        ...options,
        queryKey: QUERY_KEYS.Banners(queryConfig.networkId),
        queryFn: async () => {
            try {
                const response = await axios.get(`${generalConfig.API_URL}/banners-v2/${queryConfig.networkId}`);
                const mappedData = response.data.map((banner: Banner) => ({
                    url: banner.url,
                    image: `${generalConfig.API_URL}/banners-v2/image/${banner.image}`,
                }));

                return mappedData;
            } catch (e) {
                console.log('error', e);
                return [];
            }
        },
    });
};
