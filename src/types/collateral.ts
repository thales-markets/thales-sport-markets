import { Coins } from 'thales-utils';

export type CollateralsBalance = {
    sUSD: number;
    DAI: number;
    USDCe: number;
    USDbC: number;
    USDT: number;
    OP: number;
    WETH: number;
    ETH: number;
    ARB: number;
    USDC: number;
    THALES: number;
    sTHALES: number;
};

export type ExtendedCoins = Coins | 'THALES' | 'sTHALES';
