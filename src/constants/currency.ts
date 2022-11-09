import { keyBy } from 'lodash';

import { ReactComponent as sUSDIcon } from 'assets/currencies/sUSD.svg';
import { ReactComponent as DAIIcon } from 'assets/currencies/DAI.svg';
import { ReactComponent as USDCIcon } from 'assets/currencies/USDC.svg';
import { ReactComponent as USDTIcon } from 'assets/currencies/USDT.svg';
import { StablecoinKey } from 'utils/collaterals';

export const CURRENCY_MAP = {
    sUSD: 'sUSD',
    THALES: 'THALES',
    eUSD: 'eUSD',
};

export const USD_SIGN = '$';

export const DEFAULT_CURRENCY_DECIMALS = 2;
export const SHORT_CURRENCY_DECIMALS = 4;
export const LONG_CURRENCY_DECIMALS = 8;

// we put here due to optimization, the right way to do this is to read the payment token from the contract and then get the symbol
export const PAYMENT_CURRENCY = CURRENCY_MAP.sUSD;

export const CRYPTO_CURRENCY = ['USDC', 'USDT', 'DAI', 'sUSD'];

export const CRYPTO_CURRENCY_MAP = keyBy(CRYPTO_CURRENCY);

export const currencyKeyToAssetIconMap = {
    [CRYPTO_CURRENCY_MAP.sUSD]: sUSDIcon,
    [CRYPTO_CURRENCY_MAP.DAI]: DAIIcon,
    [CRYPTO_CURRENCY_MAP.USDC]: USDCIcon,
    [CRYPTO_CURRENCY_MAP.USDT]: USDTIcon,
};

export enum COLLATERALS_INDEX {
    'sUSD' = 0,
    'DAI' = 1,
    'USDC' = 2,
    'USDT' = 3,
}

export const COLLATERAL_INDEX_TO_COLLATERAL: StablecoinKey[] = ['sUSD', 'DAI', 'USDC', 'USDT'];

export const STABLE_DECIMALS = {
    sUSD: 18,
    DAI: 18,
    USDC: 6,
    USDT: 6,
};
