import { currencyKeyToAssetIconMap } from 'constants/currency';
import { COLLATERALS } from 'constants/markets';
import { NetworkId } from 'types/network';
import multipleCollateral from './contracts/multipleCollateralContract';

export type StablecoinKey = 'sUSD' | 'USDC' | 'USDT' | 'DAI';

export const getStableIcon = (currencyKey: StablecoinKey) => currencyKeyToAssetIconMap[currencyKey];

export const getCollateralAddress = (
    isBuy: boolean,
    isNonsUSDCollateral: boolean,
    networkId: NetworkId,
    stableIndex?: number
) => {
    const collateralKey = COLLATERALS[stableIndex ? stableIndex : 0]
        ? COLLATERALS[stableIndex ? stableIndex : 0]
        : 'sUSD';

    if (isBuy && isNonsUSDCollateral) {
        return multipleCollateral
            ? multipleCollateral[collateralKey as StablecoinKey]?.addresses[networkId]
            : undefined;
    }

    return undefined;
};
