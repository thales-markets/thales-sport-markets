import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import affiliate from 'assets/images/banner-v2/affiliate.png';
import esports from 'assets/images/banner-v2/esport.png';
import farcaster from 'assets/images/banner-v2/farcaster.png';
import overdropS2 from 'assets/images/banner-v2/overdrop-s2.png';
import useOver from 'assets/images/banner-v2/use-over.png';
import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkConfig } from 'types/network';

export type Banner = {
    url: string;
    image: string;
};

export const useBannersQuery = (
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Banner[]>({
        ...options,
        queryKey: QUERY_KEYS.Banners(networkConfig.networkId),
        queryFn: async () => {
            try {
                const response = await axios.get(`${generalConfig.API_URL}/banners-v2/${networkConfig.networkId}`);
                const mappedData = response.data.map((banner: Banner) => ({
                    url: banner.url,
                    image: `${generalConfig.API_URL}/banners-v2/image/${banner.image}`,
                }));
                mappedData.push({
                    url:
                        'https://www.overtimemarkets.xyz/?sport=PlayerProps&status=OpenMarkets&lang=en-US&showActive=false&tag=CS2%2CDOTA+2%2CValorant%2CLOL',
                    image: esports,
                });
                mappedData.push({
                    url: 'https://farcaster.xyz/overtimemarkets',
                    image: farcaster,
                });
                mappedData.push({
                    url: 'https://www.overtimemarkets.xyz/',
                    image: useOver,
                });
                mappedData.push({
                    url: 'https://www.overtimemarkets.xyz/overdrop',
                    image: overdropS2,
                });
                mappedData.push({
                    url: '',
                    image: affiliate,
                });
                return mappedData;
            } catch (e) {
                console.log('error', e);
                return [];
            }
        },
    });
};
