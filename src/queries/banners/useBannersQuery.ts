import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';

export type Banner = {
    url: string;
    image: string;
};

export const useBannersQuery = (networkId: Network, options?: UseQueryOptions<Banner[]>) => {
    return useQuery<Banner[]>(
        QUERY_KEYS.Banners(networkId),
        async () => {
            try {
                const response = await axios.get(`${generalConfig.API_URL}/banners-v2/${networkId}`);
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
        {
            ...options,
        }
    );
};
