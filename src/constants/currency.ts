import { Network } from 'enums/network';
import { keyBy } from 'lodash';
import { SupportedNetwork } from 'types/network';
import { Coins } from 'types/tokens';

export const CURRENCY_MAP = {
    sUSD: 'sUSD',
    THALES: 'THALES',
    eUSD: 'eUSD',
};

export const USD_SIGN = '$';

export const DEFAULT_CURRENCY_DECIMALS = 2;
export const SHORT_CURRENCY_DECIMALS = 4;
export const LONG_CURRENCY_DECIMALS = 8;

const CRYPTO_CURRENCY = ['sUSD', 'DAI', 'USDCe', 'USDC', 'USDT', 'OP', 'WETH', 'ETH', 'ARB', 'USDbC'];

export const CRYPTO_CURRENCY_MAP = keyBy(CRYPTO_CURRENCY);

export const STABLE_COINS = [
    CRYPTO_CURRENCY_MAP.sUSD as Coins,
    CRYPTO_CURRENCY_MAP.DAI as Coins,
    CRYPTO_CURRENCY_MAP.USDCe as Coins,
    CRYPTO_CURRENCY_MAP.USDC as Coins,
    CRYPTO_CURRENCY_MAP.USDT as Coins,
    CRYPTO_CURRENCY_MAP.USDbC as Coins,
];

export const COLLATERALS: Record<SupportedNetwork, Coins[]> = {
    [Network.OptimismMainnet]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDCe as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.OP as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
    [Network.Arbitrum]: [
        CRYPTO_CURRENCY_MAP.USDCe as Coins,
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.ARB as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
    [Network.Base]: [
        CRYPTO_CURRENCY_MAP.USDbC as Coins,
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
    [Network.OptimismSepolia]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
};

// export const COLLATERALS_AA: Record<SupportedNetwork, Coins[]> = {
//     [Network.OptimismMainnet]: [
//         CRYPTO_CURRENCY_MAP.ETH as Coins,
//         CRYPTO_CURRENCY_MAP.sUSD as Coins,
//         CRYPTO_CURRENCY_MAP.USDC as Coins,
//         CRYPTO_CURRENCY_MAP.USDT as Coins,
//         CRYPTO_CURRENCY_MAP.DAI as Coins,
//         CRYPTO_CURRENCY_MAP.OP as Coins,
//         CRYPTO_CURRENCY_MAP.WETH as Coins,
//     ],
//     [Network.Arbitrum]: [
//         CRYPTO_CURRENCY_MAP.ETH as Coins,
//         CRYPTO_CURRENCY_MAP.USDCe as Coins,
//         CRYPTO_CURRENCY_MAP.USDC as Coins,
//         CRYPTO_CURRENCY_MAP.DAI as Coins,
//         CRYPTO_CURRENCY_MAP.USDT as Coins,
//         CRYPTO_CURRENCY_MAP.ARB as Coins,
//         CRYPTO_CURRENCY_MAP.WETH as Coins,
//     ],
//     [Network.Base]: [
//         CRYPTO_CURRENCY_MAP.ETH as Coins,
//         CRYPTO_CURRENCY_MAP.USDC as Coins,
//         CRYPTO_CURRENCY_MAP.WETH as Coins,
//     ],
// };

export const COLLATERAL_DECIMALS: Record<Coins, number> = {
    sUSD: 18,
    DAI: 18,
    USDCe: 6,
    USDC: 6,
    USDbC: 6,
    USDT: 6,
    OP: 18,
    WETH: 18,
    ETH: 18,
    ARB: 18,
};
