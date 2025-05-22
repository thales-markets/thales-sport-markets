import { generalConfig } from 'config/general';
import { SupportedNetwork } from 'types/network';

const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1'; // IPv6 localhost

export const getProtectedApiRoute = (networkId: SupportedNetwork, route: string, queryString?: string) => {
    const adminApiKey = import.meta.env.VITE_APP_ADMIN_API_KEY || '';
    return `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/${route}${queryString ? `?${queryString}` : ''}${
        isLocalhost ? `${queryString ? '&' : '?'}adminApiKey=${adminApiKey}` : ''
    }`;
};
