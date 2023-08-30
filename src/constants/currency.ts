import { keyBy } from 'lodash';

import { ReactComponent as sUSDIcon } from 'assets/currencies/sUSD.svg';
import { ReactComponent as DAIIcon } from 'assets/currencies/DAI.svg';
import { ReactComponent as USDCIcon } from 'assets/currencies/USDC.svg';
import { ReactComponent as USDTIcon } from 'assets/currencies/USDT.svg';
import { StablecoinKey } from 'types/tokens';
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

const CRYPTO_CURRENCY = ['USDC', 'USDT', 'DAI', 'sUSD'];

export const CRYPTO_CURRENCY_MAP = keyBy(CRYPTO_CURRENCY);

export const currencyKeyToAssetIconMap = {
    [CRYPTO_CURRENCY_MAP.sUSD]: sUSDIcon,
    [CRYPTO_CURRENCY_MAP.DAI]: DAIIcon,
    [CRYPTO_CURRENCY_MAP.USDC]: USDCIcon,
    [CRYPTO_CURRENCY_MAP.USDT]: USDTIcon,
};

export const COLLATERALS: Record<Network, StablecoinKey[]> = {
    [Network.OptimismMainnet]: [
        CRYPTO_CURRENCY_MAP.sUSD as StablecoinKey,
        CRYPTO_CURRENCY_MAP.DAI as StablecoinKey,
        CRYPTO_CURRENCY_MAP.USDC as StablecoinKey,
        CRYPTO_CURRENCY_MAP.USDT as StablecoinKey,
    ],
    [Network.OptimismGoerli]: [
        CRYPTO_CURRENCY_MAP.sUSD as StablecoinKey,
        CRYPTO_CURRENCY_MAP.DAI as StablecoinKey,
        CRYPTO_CURRENCY_MAP.USDC as StablecoinKey,
        CRYPTO_CURRENCY_MAP.USDT as StablecoinKey,
    ],
    [Network.ArbitrumOne]: [CRYPTO_CURRENCY_MAP.USDC as StablecoinKey],
    [Network.Base]: [CRYPTO_CURRENCY_MAP.USDC as StablecoinKey],
};

export const STABLE_DECIMALS = {
    sUSD: 18,
    DAI: 18,
    USDC: 6,
    USDT: 6,
};
