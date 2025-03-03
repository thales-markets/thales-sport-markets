import { Coins, NetworkId } from 'thales-utils';
import { LiquidityPoolCollateral } from '../enums/liquidityPool';
import { LiquidityPool } from '../types/liquidityPool';
import { SupportedNetwork } from '../types/network';
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
        [LiquidityPoolCollateral.wBTC]: {
            name: 'wBTC LP',
            address: '0xbD08D8F8c17C22fb0a12Fe490F38f40c59B60d2A',
            collateral: CRYPTO_CURRENCY_MAP.wBTC as Coins,
        },
    },
    [NetworkId.Base]: {
        [LiquidityPoolCollateral.USDC]: {
            name: 'USDC LP',
            address: '0xf86e90412F52fDad8aD8D1aa2dA5B2C9a7e5f018',
            collateral: CRYPTO_CURRENCY_MAP.USDC as Coins,
        },
        [LiquidityPoolCollateral.WETH]: {
            name: 'WETH LP',
            address: '0xcc4ED8cD7101B512B134360ED3cCB759caB33f17',
            collateral: CRYPTO_CURRENCY_MAP.WETH as Coins,
        },
        [LiquidityPoolCollateral.cbBTC]: {
            name: 'cbBTC LP',
            address: '0x8d4f838327DedFc735e202731358AcFc260c207a',
            collateral: CRYPTO_CURRENCY_MAP.cbBTC as Coins,
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

export const RoundOffsetMap: Partial<Record<LiquidityPoolCollateral, Record<SupportedNetwork, number>>> = {
    [LiquidityPoolCollateral.cbBTC]: {
        [NetworkId.OptimismMainnet]: 0,
        [NetworkId.Arbitrum]: 0,
        [NetworkId.Base]: 4,
        [NetworkId.OptimismSepolia]: 0,
    },
    [LiquidityPoolCollateral.wBTC]: {
        [NetworkId.OptimismMainnet]: 0,
        [NetworkId.Arbitrum]: 27,
        [NetworkId.Base]: 0,
        [NetworkId.OptimismSepolia]: 0,
    },
};
