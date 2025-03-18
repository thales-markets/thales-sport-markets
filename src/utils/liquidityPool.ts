import { NetworkId } from 'thales-utils';
import { LiquidityPoolMap, RoundOffsetMap } from '../constants/liquidityPool';
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

export const getRoundWithOffset = (
    round: number,
    networkId: SupportedNetwork,
    lpCollateral: LiquidityPoolCollateral
) => {
    const collateralOffset = RoundOffsetMap[lpCollateral];
    if (!collateralOffset) return round;

    const roundWithOffset = round - collateralOffset[networkId];
    return roundWithOffset > 0 ? roundWithOffset : 0;
};

export const isLpAvailableForNetwork = (networkId: SupportedNetwork, lpCollateral: LiquidityPoolCollateral) =>
    (networkId === NetworkId.Base &&
        lpCollateral !== LiquidityPoolCollateral.THALES &&
        lpCollateral !== LiquidityPoolCollateral.wBTC) ||
    (networkId === NetworkId.Arbitrum && lpCollateral !== LiquidityPoolCollateral.cbBTC) ||
    (networkId === NetworkId.OptimismMainnet &&
        lpCollateral !== LiquidityPoolCollateral.cbBTC &&
        lpCollateral !== LiquidityPoolCollateral.wBTC);
