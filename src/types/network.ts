import { Network } from 'enums/network';
import { ethers } from 'ethers';

export type NetworkSettings = {
    networkId?: Network;
    signer?: ethers.Signer;
    provider?: ethers.providers.Provider;
};

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
    | Network.Mainnet
    | Network.PolygonMainnet
    | Network.Base
    | Network.ZkSync
    | Network.ZkSyncSepolia
    | Network.BlastSepolia
>;
