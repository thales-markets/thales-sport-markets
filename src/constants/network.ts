import { Network } from 'enums/network';
import { NetworkId } from 'thales-utils';
import { Address } from 'viem';
import { NetworkParams, SupportedNetwork } from '../types/network';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;
export const NATIVE_TOKEN_ADDRES = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const TBD_ADDRESS = '0xTBD' as Address;

export const SUPPORTED_NETWORKS: Record<SupportedNetwork, string> = {
    [Network.OptimismMainnet]: 'OPTIMISTIC',
    [Network.Arbitrum]: 'ARBITRUM-ONE',
    [Network.Base]: 'BASE-MAINNET',
    [Network.OptimismSepolia]: 'SEPOLIA-OPTIMISM',
};

const SUPPORTED_NETWORKS_NAMES: Record<SupportedNetwork, string> = {
    [Network.OptimismMainnet]: 'OPTIMISM MAINNET',
    [Network.Arbitrum]: 'ARBITRUM ONE',
    [Network.Base]: 'BASE MAINNET',
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
    [Network.Base]: {
        chainId: '0x2105',
        chainName: 'Base Mainnet',
        shortChainName: 'Base',
        chainKey: 'base_mainnet',
        iconClassName: 'icon icon--base',
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org/'],
        iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
        nativeCurrency: {
            symbol: 'ETH',
            decimals: 18,
        },
        order: 3,
    },
};

export const GAS_ESTIMATION_BUFFER = 1.2; // Adding 20% on gas estimation as a buffer. Used only on Optimisme

const INFURA_PROJECT_ID = import.meta.env.VITE_APP_INFURA_PROJECT_ID;

export const RPC_LIST = {
    INFURA: {
        [NetworkId.OptimismMainnet]: `https://optimism-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        [NetworkId.Arbitrum]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        [NetworkId.Base]: `https://base-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        [NetworkId.PolygonMainnet]: `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        [NetworkId.OptimismSepolia]: `https://optimism-sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
    },
};
