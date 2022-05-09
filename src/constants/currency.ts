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
