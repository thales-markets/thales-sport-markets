import { Address } from 'viem';
import { SupportedNetwork } from './network';

export type ViemContract = { abi: any; address: string; read: any; write: any };

export type ContractData = {
    addresses: Record<SupportedNetwork, Address>;
    abi: any;
};
