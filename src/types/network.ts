import { Network } from 'enums/network';
import { ethers } from 'ethers';

export type NetworkSettings = {
    networkId?: Network;
    signer?: ethers.Signer;
    provider?: ethers.providers.Provider;
};
