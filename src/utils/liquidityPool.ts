import { LiquidityPoolMap, OverRoundOffsetMap } from '../constants/liquidityPool';
import { LiquidityPoolCollateral } from '../enums/liquidityPool';
import { SupportedNetwork } from '../types/network';

export const getDefaultLpCollateral = (networkId: SupportedNetwork) => {
    const lpPerNetwork = LiquidityPoolMap[networkId];
    if (lpPerNetwork) {
        return Object.keys(lpPerNetwork)[0];
    }
    return '';
};

export const getLpAddress = (networkId: SupportedNetwork, lpCollateral: LiquidityPoolCollateral) => {
    const lpPerNetwork = LiquidityPoolMap[networkId];
    if (lpPerNetwork) {
        return lpPerNetwork[lpCollateral]?.address || '';
    }
    return '';
};

export const getLpCollateral = (networkId: SupportedNetwork, lpCollateral: LiquidityPoolCollateral) => {
    const lpPerNetwork = LiquidityPoolMap[networkId];
    if (lpPerNetwork) {
        return lpPerNetwork[lpCollateral]?.collateral || 'USDC';
    }
    return 'USDC';
};

export const getLiquidityPools = (networkId: SupportedNetwork) => {
    const lpPerNetwork = LiquidityPoolMap[networkId];
    return lpPerNetwork ? Object.values(lpPerNetwork) : [];
};

export const getRoundForOver = (round: number, networkId: SupportedNetwork) => {
    const overRound = round - OverRoundOffsetMap[networkId];
    return overRound > 0 ? overRound : 0;
};
