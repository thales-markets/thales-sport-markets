import {
    COLLATERAL_INDEX_TO_COLLATERAL,
    CRYPTO_CURRENCY_MAP,
    currencyKeyToAssetIconMap,
    STABLE_DECIMALS,
} from 'constants/currency';
import { COLLATERALS } from 'constants/markets';
import { Network } from 'enums/network';
import multipleCollateral from './contracts/multipleCollateralContract';
import { StablecoinKey } from 'types/tokens';

export const getStableIcon = (currencyKey: StablecoinKey) => currencyKeyToAssetIconMap[currencyKey];

export const getCollateralAddress = (isNonsUSDCollateral: boolean, networkId: Network, stableIndex?: number) => {
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

export const getDefaultColleteralForNetwork = (networkId: Network) => {
    if (networkId == Network.ArbitrumOne) return CRYPTO_CURRENCY_MAP.USDC;
    return CRYPTO_CURRENCY_MAP.sUSD;
};

export const getDefaultDecimalsForNetwork = (networkId: Network) => {
    if (networkId == Network.ArbitrumOne) return STABLE_DECIMALS['USDC'];
    return STABLE_DECIMALS['sUSD'];
};

export const getCollateralIndexByCollateralKey = (collateralKey: StablecoinKey) => {
    const index = COLLATERALS.indexOf(collateralKey);
    return index ? index : 0;
};
