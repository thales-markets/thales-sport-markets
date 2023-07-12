import { CHAIN_NAMESPACES, CustomChainConfig } from '@web3auth/base';
import { Network } from 'enums/network';

export const EtherspotProviderByNetworkId: Record<Network, string> = {
    [Network.OptimismMainnet]: 'https://optimism-bundler.etherspot.io/',
    [Network.OptimismGoerli]: '',
    [Network.ArbitrumOne]: 'https://arbitrum-bundler.etherspot.io/',
};

export const ETHERSPOT_SUPPORTED_NETWORKS: Record<number, CustomChainConfig> = {
    [Network.OptimismMainnet]: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: '0xa',
        rpcTarget: `https://optimism-mainnet.chainnodes.org/${process.env.REACT_APP_CHAINNODE_PROJECT_ID}`,
        displayName: 'Optimism Mainnet',
        blockExplorer: 'https://optimistic.etherscan.io/',
        ticker: 'ETH',
        tickerName: 'Ethereum',
    },
    [Network.ArbitrumOne]: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: '0xa4b1',
        rpcTarget: `https://arbitrum-one.chainnodes.org/${process.env.REACT_APP_CHAINNODE_PROJECT_ID}`,
        displayName: 'Arbitrum One',
        blockExplorer: 'https://arbiscan.io/',
        ticker: 'ETH',
        tickerName: 'Ethereum',
    },
};
