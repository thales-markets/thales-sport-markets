import { DEFAULT_CURRENCY_DECIMALS, LONG_CURRENCY_DECIMALS, SHORT_CURRENCY_DECIMALS } from 'constants/currency';
import numbro from 'numbro';

type NumericValue = string | number;
const getPrecision = (amount: NumericValue) => {
    if (amount >= 1) {
        return DEFAULT_CURRENCY_DECIMALS;
    }
    if (amount > 0.01) {
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
    `${value > 0 ? '+' : ''}${formatPercentage(value, decimals)}`;

export const getPercentageDifference = (firstNumber: number, secondNumber: number): number =>
    Math.abs(((firstNumber - secondNumber) / firstNumber) * 100);

export const truncToDecimals = (value: NumericValue, decimals = DEFAULT_CURRENCY_DECIMALS): string => {
    const matchedValue = value.toString().match(`^-?\\\d+(?:\\\.\\\d{0,${decimals}})?`);
    return matchedValue !== null ? matchedValue[0] : '0';
};

export const formatNumberShort = (value: number) => {
    // Nine Zeroes for Billions
    return value >= 1.0e9
        ? formatCurrency(value / 1.0e9, 2, true) + 'b'
        : // Six Zeroes for Millions
        value >= 1.0e6
        ? formatCurrency(value / 1.0e6, 2, true) + 'm'
        : // Three Zeroes for Thousands
        value >= 1.0e3
        ? formatCurrency(value / 1.0e3, 2, true) + 'k'
        : formatCurrency(value, 2, true);
};

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
        return str.split('-')[1] || 0;
    } else if (str.indexOf('.') !== -1) {
        return str.split('.')[1].length || 0;
    }
    return str.split('-')[1] || 0;
};
