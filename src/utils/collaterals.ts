import { COLLATERALS, CRYPTO_CURRENCY_MAP, STABLE_COINS } from 'constants/currency';

import { Network } from 'enums/network';
import { SupportedNetwork } from 'types/network';
import { Coins } from 'types/tokens';
import multipleCollateral from './contracts/multipleCollateralContract';

export const getDefaultCollateral = (networkId: SupportedNetwork) => {
    if (networkId === Network.OptimismMainnet) {
        return CRYPTO_CURRENCY_MAP.sUSD as Coins;
    }
    if (networkId === Network.Arbitrum) {
        return CRYPTO_CURRENCY_MAP.USDCe as Coins;
    }
    if (networkId === Network.Base) {
        return CRYPTO_CURRENCY_MAP.USDbC as Coins;
    }
    return COLLATERALS[networkId][0];
};

export const getCollateral = (networkId: SupportedNetwork, index: number) => COLLATERALS[networkId][index];

export const getCollaterals = (networkId: SupportedNetwork) => COLLATERALS[networkId];

export const getCollateralIndex = (networkId: SupportedNetwork, currencyKey: Coins) =>
    COLLATERALS[networkId].indexOf(currencyKey);

export const getCollateralAddress = (networkId: SupportedNetwork, index: number) =>
    multipleCollateral[getCollateral(networkId, index)]?.addresses[networkId];

export const isStableCurrency = (currencyKey: Coins) => {
    return STABLE_COINS.includes(currencyKey);
};
