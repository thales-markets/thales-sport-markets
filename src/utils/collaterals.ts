import { ADDITIONAL_COLLATERALS, COLLATERAL_DECIMALS, currencyKeyToAssetIconMap } from 'constants/currency';
import { COLLATERALS } from 'constants/currency';
import { Network } from 'enums/network';
import multipleCollateral from './contracts/multipleCollateralContract';
import { Coins } from 'types/tokens';

export const getStableIcon = (currencyKey: Coins) => currencyKeyToAssetIconMap[currencyKey];

export const getDefaultCollateral = (networkId: Network) => COLLATERALS[networkId][0];

export const getCollateral = (networkId: Network, index: number, includeAdditional?: boolean) =>
    COLLATERALS[networkId].concat(includeAdditional ? ADDITIONAL_COLLATERALS[networkId] : [])[index];

export const getCollaterals = (networkId: Network, includeAdditional?: boolean) =>
    COLLATERALS[networkId].concat(includeAdditional ? ADDITIONAL_COLLATERALS[networkId] : []);

export const getCollateralIndexForNetwork = (networkId: Network, currencyKey: Coins) =>
    COLLATERALS[networkId].concat(ADDITIONAL_COLLATERALS[networkId]).indexOf(currencyKey);

export const getCollateralAddress = (networkId: Network, index: number, includeAdditional?: boolean) =>
    multipleCollateral[getCollateral(networkId, index, includeAdditional)]?.addresses[networkId];

export const getCollateralDecimals = (networkId: Network, index: number, includeAdditional?: boolean) =>
    COLLATERAL_DECIMALS[getCollateral(networkId, index, includeAdditional)];
