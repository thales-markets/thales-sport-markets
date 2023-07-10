import { DEFAULT_CURRENCY_DECIMALS, LONG_CURRENCY_DECIMALS, SHORT_CURRENCY_DECIMALS } from 'constants/currency';
import numbro from 'numbro';

type NumericValue = string | number;
const getPrecision = (amount: NumericValue) => {
    if (Number(amount) >= 1) {
        return DEFAULT_CURRENCY_DECIMALS;
    }
    if (Number(amount) > 0.01) {
        return SHORT_CURRENCY_DECIMALS;
    }
    return LONG_CURRENCY_DECIMALS;
};

export const formatCurrency = (value: NumericValue, decimals = DEFAULT_CURRENCY_DECIMALS, trimDecimals = false) => {
    if (!value || !Number(value)) {
        return 0;
    }

    return numbro(value).format({
        thousandSeparated: true,
        trimMantissa: trimDecimals,
        mantissa: decimals,
    });
};

export const formatCurrencyWithPrecision = (value: NumericValue, trimDecimals = false) =>
    formatCurrency(value, getPrecision(value), trimDecimals);

export const formatCurrencyWithSign = (sign: string | null | undefined, value: NumericValue, decimals?: number) =>
    `${sign} ${formatCurrency(value, decimals !== undefined ? decimals : getPrecision(value))}`;

export const formatCurrencyWithKey = (
    currencyKey: string,
    value: NumericValue,
    decimals?: number,
    trimDecimals?: boolean
) => `${formatCurrency(value, decimals === undefined ? getPrecision(value) : decimals, trimDecimals)} ${currencyKey}`;

export const formatPercentage = (value: NumericValue, decimals = DEFAULT_CURRENCY_DECIMALS) => {
    let percentageValue = value;
    if (!value || !Number(value)) {
        percentageValue = 0;
    }

    return numbro(percentageValue).format({
        output: 'percent',
        mantissa: decimals,
    });
};

export const formatPercentageWithSign = (value: NumericValue, decimals = DEFAULT_CURRENCY_DECIMALS) =>
    `${Number(value) > 0 ? '+' : ''}${formatPercentage(value, decimals)}`;

export const floorNumberToDecimals = (value: number, decimals = DEFAULT_CURRENCY_DECIMALS) => {
    return Math.floor(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const roundNumberToDecimals = (value: number, decimals = DEFAULT_CURRENCY_DECIMALS) => {
    return +(Math.round(Number(value + 'e+' + decimals)) + 'e-' + decimals);
};

export const countDecimals = (value: number) => {
    if (Math.floor(value) === value) return 0;

    const str = value.toString();
    if (str.indexOf('.') !== -1 && str.indexOf('-') !== -1) {
        return Number(str.split('-')[1]) || 0;
    } else if (str.indexOf('.') !== -1) {
        return str.split('.')[1].length || 0;
    }
    return Number(str.split('-')[1]) || 0;
};
