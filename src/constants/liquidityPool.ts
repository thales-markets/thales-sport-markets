import { NetworkId } from 'thales-utils';
import { LiquidityPoolCollateral } from '../enums/liquidityPool';
import { SupportedNetwork } from '../types/network';

export const LiquidityPoolMap: Record<SupportedNetwork, any> = {
    [NetworkId.OptimismMainnet]: {
        [LiquidityPoolCollateral.USDC]: {
            name: 'USDC LP',
            address: '0x0fe1044Fc8C05482102Db14368fE88791E9B8698',
        },
        [LiquidityPoolCollateral.WETH]: {
            name: 'WETH LP',
            address: '0x4f2822D4e60af7f9F70E7e45BC1941fe3461231e',
        },
        [LiquidityPoolCollateral.THALES]: {
            name: 'THALES LP',
            address: '0xE59206b08cC96Da0818522C75eE3Fd4EBB7c0A47',
        },
    },
    [NetworkId.Base]: undefined,
    [NetworkId.Arbitrum]: undefined,
    [NetworkId.OptimismSepolia]: {
        [LiquidityPoolCollateral.USDC]: {
            name: 'USDC LP',
            address: '0x0fe1044Fc8C05482102Db14368fE88791E9B8698',
        },
        [LiquidityPoolCollateral.WETH]: {
            name: 'WETH LP',
            address: '0x4f2822D4e60af7f9F70E7e45BC1941fe3461231e',
        },
        [LiquidityPoolCollateral.THALES]: {
            name: 'THALES LP',
            address: '0xE59206b08cC96Da0818522C75eE3Fd4EBB7c0A47',
        },
    },
};
