import { keyBy } from 'lodash';

import { ReactComponent as sUSDIcon } from 'assets/currencies/sUSD.svg';
import { ReactComponent as DAIIcon } from 'assets/currencies/DAI.svg';
import { ReactComponent as USDCIcon } from 'assets/currencies/USDC.svg';
import { ReactComponent as USDTIcon } from 'assets/currencies/USDT.svg';
import { Coins } from 'types/tokens';
import { Network } from 'enums/network';

export const CURRENCY_MAP = {
    sUSD: 'sUSD',
    THALES: 'THALES',
    eUSD: 'eUSD',
};

export const USD_SIGN = '$';

export const DEFAULT_CURRENCY_DECIMALS = 2;
export const SHORT_CURRENCY_DECIMALS = 4;
export const LONG_CURRENCY_DECIMALS = 8;

const CRYPTO_CURRENCY = ['sUSD', 'DAI', 'USDCe', 'USDC', 'USDT', 'OP', 'WETH', 'ETH', 'ARB'];

export const CRYPTO_CURRENCY_MAP = keyBy(CRYPTO_CURRENCY);

export const currencyKeyToAssetIconMap = {
    [CRYPTO_CURRENCY_MAP.sUSD]: sUSDIcon,
    [CRYPTO_CURRENCY_MAP.DAI]: DAIIcon,
    [CRYPTO_CURRENCY_MAP.USDC]: USDCIcon,
    [CRYPTO_CURRENCY_MAP.USDT]: USDTIcon,
};

export const COLLATERALS: Record<Network, Coins[]> = {
    [Network.OptimismMainnet]: [
        CRYPTO_CURRENCY_MAP.sUSD as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
    ],
    [Network.OptimismGoerli]: [
        CRYPTO_CURRENCY_MAP.sUSD as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
    ],
    [Network.ArbitrumOne]: [CRYPTO_CURRENCY_MAP.USDCe as Coins],
    [Network.Base]: [CRYPTO_CURRENCY_MAP.USDC as Coins],
};

// TODO: merge with COLLATERALS when all pages will support these
export const ADDITIONAL_COLLATERALS: Record<Network, Coins[]> = {
    [Network.OptimismMainnet]: [
        CRYPTO_CURRENCY_MAP.OP as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
    [Network.OptimismGoerli]: [],
    [Network.Base]: [CRYPTO_CURRENCY_MAP.WETH as Coins, CRYPTO_CURRENCY_MAP.ETH as Coins],
    [Network.ArbitrumOne]: [
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.ARB as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
};

export const COLLATERAL_DECIMALS: Record<Coins, number> = {
    sUSD: 18,
    DAI: 18,
    USDCe: 6,
    USDC: 6,
    USDT: 6,
    OP: 18,
    WETH: 18,
    ETH: 18,
    ARB: 18,
};
