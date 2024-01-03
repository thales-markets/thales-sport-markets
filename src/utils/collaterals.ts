import { COLLATERALS_AA, COLLATERAL_DECIMALS, STABLE_COINS } from 'constants/currency';
import { COLLATERALS } from 'constants/currency';

import multipleCollateral from './contracts/multipleCollateralContract';
import { Coins } from 'types/tokens';
import { SupportedNetwork } from 'types/network';

export const getDefaultCollateral = (networkId: SupportedNetwork) => COLLATERALS[networkId][0];

export const getCollateral = (networkId: SupportedNetwork, index: number, isAA?: boolean) =>
    isAA ? COLLATERALS_AA[networkId][index] : COLLATERALS[networkId][index];

export const getCollaterals = (networkId: SupportedNetwork, isAA?: boolean) =>
    isAA ? COLLATERALS_AA[networkId] : COLLATERALS[networkId];

export const getCollateralIndex = (networkId: SupportedNetwork, currencyKey: Coins, isAA?: boolean) =>
    isAA ? COLLATERALS_AA[networkId].indexOf(currencyKey) : COLLATERALS[networkId].indexOf(currencyKey);

export const getCollateralAddress = (networkId: SupportedNetwork, index: number, isAA?: boolean) =>
    multipleCollateral[getCollateral(networkId, index, isAA)]?.addresses[networkId];

export const getCollateralDecimals = (networkId: SupportedNetwork, index: number, isAA?: boolean) =>
    COLLATERAL_DECIMALS[getCollateral(networkId, index, isAA)];

export const isStableCurrency = (currencyKey: Coins) => {
    return STABLE_COINS.includes(currencyKey);
};
