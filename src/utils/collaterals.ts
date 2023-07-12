import { STABLE_DECIMALS, currencyKeyToAssetIconMap } from 'constants/currency';
import { COLLATERALS } from 'constants/currency';
import { Network } from 'enums/network';
import multipleCollateral from './contracts/multipleCollateralContract';
import { StablecoinKey } from 'types/tokens';

export const getStableIcon = (currencyKey: StablecoinKey) => currencyKeyToAssetIconMap[currencyKey];

export const getDefaultCollateral = (networkId: Network) => COLLATERALS[networkId][0];

export const getCollateral = (networkId: Network, index: number) => COLLATERALS[networkId][index];

export const getCollaterals = (networkId: Network) => COLLATERALS[networkId];

export const getCollateralIndex = (networkId: Network, currencyKey: StablecoinKey) =>
    COLLATERALS[networkId].indexOf(currencyKey);

export const getCollateralAddress = (networkId: Network, stableIndex: number) =>
    multipleCollateral[getCollateral(networkId, stableIndex)]?.addresses[networkId];

export const getStablecoinDecimals = (networkId: Network, stableIndex: number) =>
    STABLE_DECIMALS[getCollateral(networkId, stableIndex)];
