import { Network } from 'enums/network';

export type NetworkParams = {
    chainId: string;
    chainName: string;
    shortChainName: string;
    chainKey: string;
    iconClassName: string;
    rpcUrls: string[];
    blockExplorerUrls: string[];
    iconUrls: string[];
    fraudProofWindow?: number;
    nativeCurrency: {
        symbol: string;
        decimals: number;
    };
    order: number;
};

export type NetworkConfig = {
    networkId: SupportedNetwork;
    client?: any;
};

export type SupportedNetwork = Exclude<
    Network,
    Network.Mainnet | Network.PolygonMainnet | Network.ZkSync | Network.ZkSyncSepolia | Network.BlastSepolia
>;
