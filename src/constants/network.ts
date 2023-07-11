import { Network } from 'enums/network';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const NetworkNameById: Record<Network, string> = {
    [Network.OptimismMainnet]: 'optimism mainnet',
    [Network.OptimismGoerli]: 'optimism goerli',
    [Network.ArbitrumOne]: 'ARBITRUM ONE',
};

export const CollateralByNetworkId: Record<Network, string> = {
    [Network.OptimismMainnet]: 'sUSD',
    [Network.OptimismGoerli]: 'sUSD',
    [Network.ArbitrumOne]: 'USDC',
};

export const SUPPORTED_NETWORKS = [
    {
        chainId: Network.OptimismMainnet,
        chainName: 'Optimism Mainnet',
        shortChainName: 'Optimism',
        chainKey: 'optimism_mainnet',
        iconClassName: 'icon icon--op',
        isMultiCollateralSupported: true,
    },
    {
        chainId: Network.ArbitrumOne,
        chainName: 'Arbitrum One',
        shortChainName: 'Arbitrum',
        chainKey: 'arbitrum_mainnet',
        iconClassName: 'icon icon--arb',
        isMultiCollateralSupported: false,
    },
    {
        chainId: Network.OptimismGoerli,
        chainName: 'Optimism Goerli Testnet',
        shortChainName: 'Optimism Goerli Testnet',
        chainKey: 'optimism_mainnet',
        iconClassName: 'icon icon--op',
        isMultiCollateralSupported: true,
    },
];

type OptimismNetwork = {
    chainId: string;
    chainName: string;
    rpcUrls: string[];
    blockExplorerUrls: string[];
    iconUrls: string[];
    fraudProofWindow?: number;
    nativeCurrency: {
        symbol: string;
        decimals: number;
    };
};

export const SUPPORTED_NETWORKS_DESCRIPTIONS: Record<number, OptimismNetwork> = {
    [Network.OptimismMainnet]: {
        chainId: '0xA',
        chainName: 'Optimism',
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimistic.etherscan.io/'],
        iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
        nativeCurrency: {
            symbol: 'ETH',
            decimals: 18,
        },
    },
    [Network.OptimismGoerli]: {
        chainId: '0x420',
        chainName: 'Optimism Goerli',
        rpcUrls: ['https://goerli.optimism.io/'],
        blockExplorerUrls: ['https://goerli-optimism.etherscan.io/'],
        iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
        nativeCurrency: {
            symbol: 'ETH',
            decimals: 18,
        },
    },
    [Network.ArbitrumOne]: {
        chainId: '0xA4B1',
        chainName: 'Arbitrum One',
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io/'],
        iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
        nativeCurrency: {
            symbol: 'ETH',
            decimals: 18,
        },
    },
};

export const MAX_GAS_LIMIT = 29000000;

export const NETWORK_SWITCHER_SUPPORTED_NETWORKS = [
    {
        networkId: 10,
        chainId: '0xA',
        chainName: 'Optimism Mainnet',
        shortChainName: 'Optimism',
        chainKey: 'optimism_mainnet',
        iconClassName: 'icon icon--op',
    },
    {
        networkId: Network.ArbitrumOne,
        chainId: '0xa4b1',
        chainName: 'Arbitrum One',
        shortChainName: 'Arbitrum',
        chainKey: 'arbitrum_mainnet',
        iconClassName: 'icon icon--arb',
    },
];
