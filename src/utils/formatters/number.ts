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
    `${sign}${formatCurrency(value, decimals || getPrecision(value))}`;

export const formatCurrencyWithKey = (
    currencyKey: string,
    value: NumericValue,
    decimals?: number,
    trimDecimals?: boolean
) => `${formatCurrency(value, decimals || getPrecision(value), trimDecimals)} ${currencyKey}`;

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
