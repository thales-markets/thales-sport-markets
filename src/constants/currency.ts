import { Network } from 'enums/network';
import { keyBy } from 'lodash';
import { SupportedNetwork } from 'types/network';
import { Coins } from 'thales-utils';

export const USD_SIGN = '$';

const CRYPTO_CURRENCY = [
    'sUSD',
    'DAI',
    'USDCe',
    'USDC',
    'USDT',
    'OP',
    'WETH',
    'ETH',
    'ARB',
    'USDbC',
    'THALES',
    'sTHALES',
];

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
        CRYPTO_CURRENCY_MAP.THALES as Coins,
        CRYPTO_CURRENCY_MAP.sUSD as Coins,
        CRYPTO_CURRENCY_MAP.USDCe as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.OP as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
    [Network.Arbitrum]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.THALES as Coins,
        CRYPTO_CURRENCY_MAP.USDCe as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.ARB as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
    // [Network.Base]: [
    //     CRYPTO_CURRENCY_MAP.USDbC as Coins,
    //     CRYPTO_CURRENCY_MAP.USDC as Coins,
    //     CRYPTO_CURRENCY_MAP.WETH as Coins,
    //     CRYPTO_CURRENCY_MAP.ETH as Coins,
    // ],
    [Network.OptimismSepolia]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.THALES as Coins,
        CRYPTO_CURRENCY_MAP.sTHALES as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
};

export const FREE_BET_COLLATERALS: Record<SupportedNetwork, Coins[]> = {
    [Network.OptimismMainnet]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.THALES as Coins,
        CRYPTO_CURRENCY_MAP.sUSD as Coins,
        CRYPTO_CURRENCY_MAP.USDCe as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.OP as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
    ],
    [Network.Arbitrum]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.THALES as Coins,
        CRYPTO_CURRENCY_MAP.USDCe as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.ARB as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
    ],
    // [Network.Base]: [
    //     CRYPTO_CURRENCY_MAP.USDbC as Coins,
    //     CRYPTO_CURRENCY_MAP.USDC as Coins,
    //     CRYPTO_CURRENCY_MAP.WETH as Coins,
    //     CRYPTO_CURRENCY_MAP.ETH as Coins,
    // ],
    [Network.OptimismSepolia]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
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

export const COLLATERAL_ICONS_CLASS_NAMES: Record<Coins, string> = {
    sUSD: 'currency-icon currency-icon--susd',
    DAI: 'currency-icon currency-icon--dai',
    USDCe: 'currency-icon currency-icon--usdce',
    USDC: 'currency-icon currency-icon--usdc',
    USDbC: 'currency-icon currency-icon--usdbc',
    USDT: 'currency-icon currency-icon--usdt',
    OP: 'currency-icon currency-icon--op',
    WETH: 'currency-icon currency-icon--weth',
    ETH: 'currency-icon currency-icon--eth',
    ARB: 'currency-icon currency-icon--arb',
    THALES: 'currency-icon currency-icon--thales',
    sTHALES: 'currency-icon currency-icon--thales',
};
