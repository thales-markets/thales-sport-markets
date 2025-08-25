import { SpeedPositions } from 'enums/speedMarkets';
import { Coins } from 'thales-utils';
import { CollateralsBalance } from './collateral';

export type SelectedPosition = SpeedPositions.UP | SpeedPositions.DOWN | undefined;

export type RiskPerAsset = { currency: string; current: number; max: number };
export type RiskPerAssetAndPosition = RiskPerAsset & { position: SpeedPositions };

export type AmmSpeedMarketsLimits = {
    maxBuyinAmount: number;
    minBuyinAmount: number;
    minimalTimeToMaturity: number;
    maximalTimeToMaturity: number;
    maxPriceDelaySec: number;
    maxPriceDelayForResolvingSec: number;
    risksPerAsset: RiskPerAsset[];
    risksPerAssetAndDirection: RiskPerAssetAndPosition[];
    timeThresholdsForFees: number[];
    lpFees: number[];
    defaultLPFee: number;
    maxSkewImpact: number;
    safeBoxImpact: number;
    whitelistedAddress: boolean;
    bonusPerCollateral: CollateralsBalance;
};

export type UserPosition = {
    user: string;
    market: string;
    asset: string;
    side: SpeedPositions;
    strikePrice: number;
    maturityDate: number;
    paid: number;
    payout: number;
    collateralAddress: string;
    isDefaultCollateral: boolean;
    isFreeBet: boolean;
    currentPrice: number;
    finalPrice: number;
    isClaimable: boolean;
    isResolved: boolean;
    createdAt: number;
};

export type ShareSpeedPositionType = 'speed-potential' | 'speed-won' | 'speed-loss';

export type ShareSpeedPositionData = {
    type: ShareSpeedPositionType;
    position: SpeedPositions;
    asset: string;
    strikePrice: number;
    paid: number;
    payout: number;
    collateral: Coins;
    marketDuration: string;
};
