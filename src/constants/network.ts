import { Network } from 'enums/network';
import { Chain } from 'wagmi';
import { NetworkParams, SupportedNetwork } from '../types/network';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NATIVE_TOKEN_ADDRES = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const SAFE_BOX_ADDRESS = {
    [Network.OptimismMainnet]: '0xE853207c30F3c32Eda9aEfFDdc67357d5332978C',
    [Network.Arbitrum]: '0xCd9c0E99396627C7746b4363B880939Ac2828d3E',
    [Network.OptimismSepolia]: '0xd866b2332d4383c1bf719732177e2d9109c99dbc',
};

export const SUPPORTED_NETWORKS: Record<SupportedNetwork, string> = {
    [Network.OptimismMainnet]: 'OPTIMISTIC',
    [Network.Arbitrum]: 'ARBITRUM-ONE',
    [Network.OptimismSepolia]: 'SEPOLIA-OPTIMISM',
};

export const SUPPORTED_NETWORKS_NAMES: Record<SupportedNetwork, string> = {
    [Network.OptimismMainnet]: 'OPTIMISM MAINNET',
    [Network.Arbitrum]: 'ARBITRUM ONE',
    [Network.OptimismSepolia]: 'OPTIMISM SEPOLIA',
};

export const DEFAULT_NETWORK: { name: string; networkId: SupportedNetwork } = {
    name: SUPPORTED_NETWORKS_NAMES[Network.OptimismMainnet],
    networkId: Network.OptimismMainnet,
};

export const SUPPORTED_NETWORKS_PARAMS: Record<number, NetworkParams> = {
    [Network.OptimismMainnet]: {
        chainId: '0xA',
        chainName: 'Optimism Mainnet',
        shortChainName: 'Optimism',
        chainKey: 'optimism_mainnet',
        iconClassName: 'icon icon--op',
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimistic.etherscan.io/'],
        iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
        nativeCurrency: {
            symbol: 'ETH',
            decimals: 18,
        },
        order: 1,
    },
    [Network.Arbitrum]: {
        chainId: '0xA4B1',
        chainName: 'Arbitrum One',
        shortChainName: 'Arbitrum',
        chainKey: 'arbitrum_mainnet',
        iconClassName: 'icon icon--arb',
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io/'],
        iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
        nativeCurrency: {
            symbol: 'ETH',
            decimals: 18,
        },
        order: 2,
    },
};

export const GAS_ESTIMATION_BUFFER = 1.2; // Adding 20% on gas estimation as a buffer. Used only on Optimisme

// configuration for wagmi
export const optimismSepolia = {
    id: 11155420,
    network: 'OP Sepolia',
    name: 'OP Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://sepolia.optimism.io'],
        },
        public: {
            http: ['https://sepolia.optimism.io'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Blockscout',
            url: 'https://optimism-sepolia.blockscout.com',
            apiUrl: 'https://optimism-sepolia.blockscout.com/api',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 1620204,
        },
    },
} as Chain;
