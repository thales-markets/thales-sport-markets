import { SpeedPositions } from 'enums/speedMarkets';
import { CRYPTO_CURRENCY_MAP } from './currency';

export const SUPPORTED_ASSETS = [CRYPTO_CURRENCY_MAP.BTC, CRYPTO_CURRENCY_MAP.ETH];

export const BICONOMY_MAX_FEE_PERCENTAGE = 0.01; // 1%

export const MIN_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE = 0.4; // 40%
export const MAX_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE = 0.05; // 5%

export const SIDE_TO_POSITION_MAP: Record<number, SpeedPositions> = {
    0: SpeedPositions.UP,
    1: SpeedPositions.DOWN,
};
