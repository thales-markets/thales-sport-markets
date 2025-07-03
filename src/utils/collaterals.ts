import { COLLATERALS, CRYPTO_CURRENCY_MAP, FREE_BET_COLLATERALS, STABLE_COINS } from 'constants/currency';
import { ALTCOIN_CONVERSION_BUFFER_PERCENTAGE } from 'constants/markets';
import _ from 'lodash';
import {
    COLLATERAL_DECIMALS,
    Coins,
    DEFAULT_CURRENCY_DECIMALS,
    LONG_CURRENCY_DECIMALS,
    ceilNumberToDecimals,
} from 'thales-utils';
import { Rates } from 'types/collateral';
import { SupportedNetwork } from 'types/network';
import multipleCollateral from './contracts/multipleCollateralContract';

export const getDefaultCollateral = (networkId: SupportedNetwork) => COLLATERALS[networkId][0];

export const getCollateral = (networkId: SupportedNetwork, index: number, collaterals?: Coins[]) => {
    const collats = collaterals || COLLATERALS[networkId];
    return index < collats.length ? collats[index] : collats[0];
};

export const getCollaterals = (networkId: SupportedNetwork) => COLLATERALS[networkId];

export const getFreeBetCollaterals = (networkId: SupportedNetwork) => FREE_BET_COLLATERALS[networkId];

export const getCollateralIndex = (networkId: SupportedNetwork, currencyKey: Coins, collaterals?: Coins[]) =>
    (collaterals || getCollaterals(networkId)).indexOf(currencyKey);

export const getCollateralAddress = (networkId: SupportedNetwork, index: number, collaterals?: Coins[]) =>
    multipleCollateral[getCollateral(networkId, index, collaterals)]?.addresses[networkId];

export const getCollateralByAddress = (collateralAddress: string, networkId: number) => {
    let collateral = getDefaultCollateral(networkId);
    Object.keys(multipleCollateral).forEach((collateralKey: string) => {
        Object.values(multipleCollateral[collateralKey as Coins].addresses).forEach((address: string) => {
            if (collateralAddress.toLowerCase() === address.toLowerCase()) {
                collateral = collateralKey as Coins;
            }
        });
    });

    return collateral;
};

export const isStableCurrency = (currencyKey: Coins) => {
    return STABLE_COINS.includes(currencyKey);
};

export const isOverCurrency = (currencyKey: Coins) => {
    return currencyKey === CRYPTO_CURRENCY_MAP.OVER;
};

export const isLpSupported = (currencyKey: Coins) => {
    return (
        currencyKey === CRYPTO_CURRENCY_MAP.USDC ||
        currencyKey === CRYPTO_CURRENCY_MAP.WETH ||
        currencyKey === CRYPTO_CURRENCY_MAP.ETH ||
        currencyKey === CRYPTO_CURRENCY_MAP.cbBTC ||
        currencyKey === CRYPTO_CURRENCY_MAP.wBTC ||
        currencyKey === CRYPTO_CURRENCY_MAP.THALES ||
        currencyKey === CRYPTO_CURRENCY_MAP.sTHALES ||
        isOverCurrency(currencyKey)
    );
};

export const mapMultiCollateralBalances = (
    data: any,
    exchangeRates: Rates | null,
    networkId: SupportedNetwork
): Array<{ index: number; collateralKey: Coins; balance: number; balanceDollarValue: number }> | undefined => {
    if (!data) return;
    return Object.keys(data).map((key) => {
        return {
            index: getCollateralIndex(networkId, key as Coins),
            balance: data[key as string] as number,
            balanceDollarValue:
                (data[key] ? data[key] : 0) * (isStableCurrency(key as Coins) ? 1 : exchangeRates?.[key] || 0),
            collateralKey: key as Coins,
        };
    });
};

export const getMaxCollateralDollarValue = (
    data: Array<{ index: number; collateralKey: Coins; balance: number; balanceDollarValue: number }>
) => {
    const maxItem = _.maxBy(data, 'balanceDollarValue');
    return maxItem;
};

export const sortCollateralBalances = (
    data: any,
    exchangeRates: Rates | null,
    networkId: SupportedNetwork,
    orderBy: 'asc' | 'desc'
) => {
    const newObject = {} as any;

    const mappedData = mapMultiCollateralBalances(data, exchangeRates, networkId);

    const sortedData = _.orderBy(mappedData, 'balanceDollarValue', orderBy);

    sortedData.forEach((item) => {
        newObject[item.collateralKey] = item.balance;
    });
    return newObject;
};

export const convertCollateralToStable = (srcCollateral: Coins, amount: number, rate: number) => {
    return isStableCurrency(srcCollateral) ? amount : amount * rate;
};

export const convertFromStableToCollateral = (
    dstCollateral: Coins,
    amount: number,
    rate: number,
    networkId: SupportedNetwork
) => {
    const defaultCollateral = getDefaultCollateral(networkId);
    const decimals = isStableCurrency(dstCollateral) ? DEFAULT_CURRENCY_DECIMALS : LONG_CURRENCY_DECIMALS;

    if (dstCollateral == defaultCollateral) {
        return amount;
    } else {
        const priceFeedBuffer = 1 - ALTCOIN_CONVERSION_BUFFER_PERCENTAGE;
        return rate
            ? ceilNumberToDecimals(
                  Math.ceil((amount / (rate * priceFeedBuffer)) * 10 ** COLLATERAL_DECIMALS[dstCollateral]) /
                      10 ** COLLATERAL_DECIMALS[dstCollateral],
                  decimals
              )
            : 0;
    }
};
