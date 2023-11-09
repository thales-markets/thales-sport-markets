import { COLLATERAL_DECIMALS, PARTICAL_COLLATERALS, STABLE_COINS } from 'constants/currency';
import { COLLATERALS } from 'constants/currency';
import { Network } from 'enums/network';
import multipleCollateral from './contracts/multipleCollateralContract';
import { Coins } from 'types/tokens';

export const getDefaultCollateral = (networkId: Network) => COLLATERALS[networkId][0];

export const getCollateral = (networkId: Network, index: number) => COLLATERALS[networkId][index];

export const getCollaterals = (networkId: Network, particalWallet?: boolean) =>
    particalWallet ? PARTICAL_COLLATERALS[networkId] : COLLATERALS[networkId];

export const getCollateralIndex = (networkId: Network, currencyKey: Coins) =>
    COLLATERALS[networkId].indexOf(currencyKey);

export const getCollateralAddress = (networkId: Network, index: number) =>
    multipleCollateral[getCollateral(networkId, index)]?.addresses[networkId];

export const getCollateralDecimals = (networkId: Network, index: number) =>
    COLLATERAL_DECIMALS[getCollateral(networkId, index)];

export const isStableCurrency = (currencyKey: Coins) => {
    return STABLE_COINS.includes(currencyKey);
};
