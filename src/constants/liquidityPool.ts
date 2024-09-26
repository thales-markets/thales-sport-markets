import { NetworkId } from 'thales-utils';
import { LiquidityPoolCollateral } from '../enums/liquidityPool';
import { LiquidityPool } from '../types/liquidityPool';
import { SupportedNetwork } from '../types/network';
import { Coins } from 'thales-utils';
import { CRYPTO_CURRENCY_MAP } from './currency';

export const LiquidityPoolMap: Record<
    SupportedNetwork,
    Partial<Record<LiquidityPoolCollateral, LiquidityPool>> | undefined
> = {
    [NetworkId.OptimismMainnet]: {
        [LiquidityPoolCollateral.USDC]: {
            name: 'USDC LP',
            address: '0x0fe1044Fc8C05482102Db14368fE88791E9B8698',
            collateral: CRYPTO_CURRENCY_MAP.USDC as Coins,
        },
        [LiquidityPoolCollateral.WETH]: {
            name: 'WETH LP',
            address: '0x4f2822D4e60af7f9F70E7e45BC1941fe3461231e',
            collateral: CRYPTO_CURRENCY_MAP.WETH as Coins,
        },
        [LiquidityPoolCollateral.THALES]: {
            name: 'THALES LP',
            address: '0xE59206b08cC96Da0818522C75eE3Fd4EBB7c0A47',
            collateral: CRYPTO_CURRENCY_MAP.THALES as Coins,
        },
    },
    // [NetworkId.Base]: undefined,
    [NetworkId.Arbitrum]: {
        [LiquidityPoolCollateral.USDC]: {
            name: 'USDC LP',
            address: '0x22D180F39A0eB66098cf839AF5e3C6b009383B6A',
            collateral: CRYPTO_CURRENCY_MAP.USDC as Coins,
        },
        [LiquidityPoolCollateral.WETH]: {
            name: 'WETH LP',
            address: '0xcB4728a1789B87E05c813B68DBc5E6A98a4856bA',
            collateral: CRYPTO_CURRENCY_MAP.WETH as Coins,
        },
        [LiquidityPoolCollateral.THALES]: {
            name: 'THALES LP',
            address: '0x9733AB157f5A89f0AD7460d08F869956aE2018dA',
            collateral: CRYPTO_CURRENCY_MAP.THALES as Coins,
        },
    },
    [NetworkId.OptimismSepolia]: {
        [LiquidityPoolCollateral.USDC]: {
            name: 'USDC LP',
            address: '0xAE145Fe3Af36aAE9135c488E9B728eD504B2385C',
            collateral: CRYPTO_CURRENCY_MAP.USDC as Coins,
        },
        [LiquidityPoolCollateral.WETH]: {
            name: 'WETH LP',
            address: '0xCb99b139a30fa2C09a8396B4a1cCda06D91DdC72',
            collateral: CRYPTO_CURRENCY_MAP.WETH as Coins,
        },
        [LiquidityPoolCollateral.THALES]: {
            name: 'THALES LP',
            address: '0x93ca60840984348f8Dc4d81e274a12CAaDDC59aE',
            collateral: CRYPTO_CURRENCY_MAP.THALES as Coins,
        },
    },
};
