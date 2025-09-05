import { Network } from 'enums/network';

export const generalConfig = {
    API_URL: 'https://api.overtime.io',
    OVERDROP_API_URL: 'https://overdrop.overtime.io',
    PYTH_API_URL: 'https://hermes.pyth.network/v2/updates/price/latest',
};

export const noCacheConfig = { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' } };

export enum ViteEnvKeys {
    DEV = 'DEV',
    VITE_APP_ONRAMPER_KEY = 'VITE_APP_ONRAMPER_KEY',
    VITE_APP_IPFS_DEPLOYMENT = 'VITE_APP_IPFS_DEPLOYMENT',
    VITE_APP_INFURA_PROJECT_ID = 'VITE_APP_INFURA_PROJECT_ID',
    VITE_APP_DRPC_PROJECT_ID = 'VITE_APP_DRPC_PROJECT_ID',
    VITE_APP_BICONOMY_BUNDLE_KEY = 'VITE_APP_BICONOMY_BUNDLE_KEY',
    VITE_APP_ADMIN_API_KEY = 'VITE_APP_ADMIN_API_KEY',
    VITE_APP_WALLET_CONNECT_PROJECT_ID = 'VITE_APP_WALLET_CONNECT_PROJECT_ID',
    VITE_APP_PARTICLE_PROJECT_ID = 'VITE_APP_PARTICLE_PROJECT_ID',
    VITE_APP_PARTICLE_CLIENT_KEY = 'VITE_APP_PARTICLE_CLIENT_KEY',
    VITE_APP_PARTICLE_API_ID = 'VITE_APP_PARTICLE_API_ID',
    VITE_APP_UA_PROJECT_ID = 'VITE_APP_UA_PROJECT_ID',
    VITE_APP_PAYMASTER_KEY_OP = `VITE_APP_PAYMASTER_KEY_${Network.OptimismMainnet}`,
    VITE_APP_PAYMASTER_KEY_ARB = `VITE_APP_PAYMASTER_KEY_${Network.Arbitrum}`,
    VITE_APP_PAYMASTER_KEY_BASE = `VITE_APP_PAYMASTER_KEY_${Network.Base}`,
    VITE_APP_PAYMASTER_KEY_OP_SEPOLIA = `VITE_APP_PAYMASTER_KEY_${Network.OptimismSepolia}`,
}

export const getEnv = (name: ViteEnvKeys) => {
    const encodedName = btoa(name.split('').reverse().join(''));
    const value = import.meta.env[encodedName];

    if (!value) {
        console.error(`Env ${name} not defined`);
        return '';
    }

    const decodedValue = atob(value).split('').reverse().join('');
    return decodedValue;
};
