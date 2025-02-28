import { Network } from 'enums/network';

export type FreeBet = {
    betAmount: number;
    network: Network;
    collateral: string;
    claimSuccess: boolean;
    timestamp: number;
};
