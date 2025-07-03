import { SpeedPositions } from 'enums/speedMarkets';

export type Risk = { current: number; max: number };
export type RiskPerAsset = { currency: string; current: number; max: number };
export type RiskPerAssetAndPosition = RiskPerAsset & { position: SpeedPositions };
