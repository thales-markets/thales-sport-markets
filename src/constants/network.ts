import { Network } from 'enums/network';
import { Chain } from 'wagmi';
import { NetworkParams, SupportedNetwork } from '../types/network';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NATIVE_TOKEN_ADDRES = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const SUPPORTED_NETWORKS: Record<SupportedNetwork, string> = {
    [Network.OptimismMainnet]: 'OPTIMISTIC',
    // [Network.Arbitrum]: 'ARBITRUM-ONE',
    // [Network.Base]: 'BASE',
    [Network.OptimismSepolia]: 'SEPOLIA-OPTIMISM',
};

export const SUPPORTED_NETWORKS_NAMES: Record<SupportedNetwork, string> = {
    [Network.OptimismMainnet]: 'OPTIMISM MAINNET',
    // [Network.Arbitrum]: 'ARBITRUM ONE',
    // [Network.Base]: 'BASE',
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
    // [Network.Arbitrum]: {
    //     chainId: '0xA4B1',
    //     chainName: 'Arbitrum One',
    //     shortChainName: 'Arbitrum',
    //     chainKey: 'arbitrum_mainnet',
    //     iconClassName: 'icon icon--arb',
    //     rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    //     blockExplorerUrls: ['https://arbiscan.io/'],
    //     iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
    //     nativeCurrency: {
    //         symbol: 'ETH',
    //         decimals: 18,
    //     },
    //     order: 2,
    // },
    // [Network.Base]: {
    //     chainId: '0x2105',
    //     chainName: 'Base Mainnet',
    //     shortChainName: 'Base',
    //     chainKey: 'base_mainnet',
    //     iconClassName: 'icon icon--base',
    //     rpcUrls: ['https://mainnet.base.org'],
    //     blockExplorerUrls: ['https://basescan.org/'],
    //     iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
    //     nativeCurrency: {
    //         symbol: 'ETH',
    //         decimals: 18,
    //     },
    //     order: 3,
    // },
    // [Network.OptimismSepolia]: {
    //     chainId: '0xaa37dc',
    //     chainName: 'Optimism Sepolia',
    //     shortChainName: 'OP Sepolia',
    //     chainKey: 'optimism_sepolia',
    //     iconClassName: 'icon icon--op',
    //     rpcUrls: ['https://sepolia.optimism.io'],
    //     blockExplorerUrls: ['https://sepolia-optimism.etherscan.io'],
    //     iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
    //     nativeCurrency: {
    //         symbol: 'ETH',
    //         decimals: 18,
    //     },
    //     order: 4,
    // },
};

export const GAS_ESTIMATION_BUFFER = 1.2; // Adding 20% on gas estimation as a buffer. Used only on Optimisme

// configuration for wagmi
export const base = {
    id: 8453,
    network: 'base',
    name: 'Base',
    nativeCurrency: { name: 'Base', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://mainnet.base.org'],
        },
        public: {
            http: ['https://mainnet.base.org'],
        },
    },
    blockExplorers: {
        blockscout: {
            name: 'Basescout',
            url: 'https://base.blockscout.com',
        },
        default: {
            name: 'Basescan',
            url: 'https://basescan.org',
        },
        etherscan: {
            name: 'Basescan',
            url: 'https://basescan.org',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 5022,
        },
    },
} as Chain;

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
