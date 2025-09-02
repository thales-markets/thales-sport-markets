import { Network } from 'enums/network';

export type FreeBet = {
    id: string;
    betAmount: number;
    network: Network.OptimismMainnet | Network.Arbitrum | Network.Base;
    collateral: string;
    claimSuccess: boolean;
    timestamp: number;
    claimAddress: string;
};
