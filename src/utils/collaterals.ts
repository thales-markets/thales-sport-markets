import { COLLATERALS, COLLATERALS_AA, COLLATERAL_DECIMALS, STABLE_COINS } from 'constants/currency';
import { Network } from 'enums/network';
import multipleCollateral from './contracts/multipleCollateralContract';
import { Coins } from 'types/tokens';

export const getDefaultCollateral = (networkId: Network) => COLLATERALS[networkId][0];

export const getCollateral = (networkId: Network, index: number, isAA?: boolean) =>
    isAA ? COLLATERALS_AA[networkId][index] : COLLATERALS[networkId][index];

export const getCollaterals = (networkId: Network, isAA?: boolean) =>
    isAA ? COLLATERALS_AA[networkId] : COLLATERALS[networkId];

export const getCollateralIndex = (networkId: Network, currencyKey: Coins, isAA?: boolean) =>
    isAA ? COLLATERALS_AA[networkId].indexOf(currencyKey) : COLLATERALS[networkId].indexOf(currencyKey);

export const getCollateralAddress = (networkId: Network, index: number, isAA?: boolean) =>
    multipleCollateral[getCollateral(networkId, index, isAA)]?.addresses[networkId];

export const getCollateralDecimals = (networkId: Network, index: number, isAA?: boolean) =>
    COLLATERAL_DECIMALS[getCollateral(networkId, index, isAA)];

export const isStableCurrency = (currencyKey: Coins) => {
    return STABLE_COINS.includes(currencyKey);
};
