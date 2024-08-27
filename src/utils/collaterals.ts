import { COLLATERALS, CRYPTO_CURRENCY_MAP, FREE_BET_COLLATERALS, STABLE_COINS } from 'constants/currency';
import _ from 'lodash';
import { Rates } from 'queries/rates/useExchangeRatesQuery';
import { SupportedNetwork } from 'types/network';
import { Coins } from 'types/tokens';
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

// TODO: for OP Sepolia, add generic logic per network
export const isLpSupported = (currencyKey: Coins) => {
    return (
        currencyKey === CRYPTO_CURRENCY_MAP.USDC ||
        currencyKey === CRYPTO_CURRENCY_MAP.WETH ||
        currencyKey === CRYPTO_CURRENCY_MAP.ETH ||
        currencyKey === CRYPTO_CURRENCY_MAP.THALES
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
