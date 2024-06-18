import axios from 'axios';
import { generalConfig } from 'config/general';
import { API_ROUTES } from 'constants/routes';

export const getCacheKey = (prefixKey: string, keys: any[]) => {
    keys.unshift(prefixKey);

    return keys
        .filter((item) => item)
        .map((item) => {
            if (typeof item !== 'string') return item?.toString();
            return item?.toLowerCase();
        })
        .join('-');
};

export const invalidateCache = async (cacheKeys: string[]) => {
    try {
        await axios.post(`${generalConfig.API_URL}/${API_ROUTES.CacheControl}`, {
            cacheKeys: cacheKeys,
        });

        return;
    } catch (e) {
        console.log('Error while invalidating cache on API ', e);
        return;
    }
};

export const wait = (seconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};
