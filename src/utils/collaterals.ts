import { COLLATERAL_INDEX_TO_COLLATERAL, currencyKeyToAssetIconMap, STABLE_DECIMALS } from 'constants/currency';
import { COLLATERALS } from 'constants/markets';
import { NetworkId } from 'types/network';
import multipleCollateral from './contracts/multipleCollateralContract';

export type StablecoinKey = 'sUSD' | 'USDC' | 'USDT' | 'DAI';

export const getStableIcon = (currencyKey: StablecoinKey) => currencyKeyToAssetIconMap[currencyKey];

export const getCollateralAddress = (isNonsUSDCollateral: boolean, networkId: NetworkId, stableIndex?: number) => {
    const collateralKey = COLLATERALS[stableIndex ? stableIndex : 0]
        ? COLLATERALS[stableIndex ? stableIndex : 0]
        : 'sUSD';

    if (isNonsUSDCollateral) {
        return multipleCollateral
            ? multipleCollateral[collateralKey as StablecoinKey]?.addresses[networkId]
            : undefined;
    }

    return undefined;
};

export const getDecimalsByStableCoinIndex = (stableIndex: number) => {
    const collateralKey = COLLATERAL_INDEX_TO_COLLATERAL[stableIndex];
    return STABLE_DECIMALS[collateralKey];
};
