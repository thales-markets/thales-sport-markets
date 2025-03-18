import { Network } from 'enums/network';
import { keyBy } from 'lodash';
import { Coins } from 'thales-utils';
import { SupportedNetwork } from 'types/network';

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
    'OVER',
    'cbBTC',
    'BTC',
    'wBTC',
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
        CRYPTO_CURRENCY_MAP.sTHALES as Coins,
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
        CRYPTO_CURRENCY_MAP.sTHALES as Coins,
        CRYPTO_CURRENCY_MAP.USDCe as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.ARB as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
        CRYPTO_CURRENCY_MAP.wBTC as Coins,
    ],
    [Network.Base]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDbC as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
        CRYPTO_CURRENCY_MAP.cbBTC as Coins,
    ],
    [Network.OptimismSepolia]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.THALES as Coins,
        CRYPTO_CURRENCY_MAP.sTHALES as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
};

// TODO: remove after MM
export const MARCH_MADNESS_COLLATERALS: Record<SupportedNetwork, Coins[]> = {
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
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDCe as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.ARB as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
    [Network.Base]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDbC as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
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
    [Network.Base]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDbC as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
    ],
    [Network.OptimismSepolia]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.THALES as Coins,
    ],
};

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
    cbBTC: 'currency-icon currency-icon--cbbtc',
    wBTC: 'currency-icon currency-icon--wbtc',
};

export const DEFAULT_MULTI_COLLATERAL_BALANCE = {
    sUSD: 0,
    DAI: 0,
    USDCe: 0,
    USDbC: 0,
    USDT: 0,
    OP: 0,
    WETH: 0,
    ETH: 0,
    ARB: 0,
    USDC: 0,
    THALES: 0,
    sTHALES: 0,
    cbBTC: 0,
    wBTC: 0,
};
