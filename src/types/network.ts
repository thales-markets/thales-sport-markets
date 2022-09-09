import { ethers } from 'ethers';

export type NetworkId = 5 | 10 | 42 | 420;

export type EthereumProvider = {
    isMetaMask: boolean;
    chainId: string;
};

export type NetworkSettings = {
    networkId?: NetworkId;
    signer?: ethers.Signer;
    provider?: ethers.providers.Provider;
};
