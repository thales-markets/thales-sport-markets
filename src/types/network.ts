import { ethers } from 'ethers';

export type NetworkId = 5 | 10 | 42 | 420 | 42161;

export type NetworkSettings = {
    networkId?: NetworkId;
    signer?: ethers.Signer;
    provider?: ethers.providers.Provider;
};
