import { SpeedPositions } from 'enums/speedMarkets';
import { CRYPTO_CURRENCY_MAP } from './currency';

export const SUPPORTED_ASSETS = [CRYPTO_CURRENCY_MAP.BTC, CRYPTO_CURRENCY_MAP.ETH];

export const POSITIONS_TO_SIDE_MAP: Record<SpeedPositions, number> = {
    UP: 0,
    DOWN: 1,
};

export const SIDE_TO_POSITION_MAP: Record<number, SpeedPositions> = {
    0: SpeedPositions.UP,
    1: SpeedPositions.DOWN,
};

export const SPEED_MARKETS_QUOTE = 2;

export const BICONOMY_MAX_FEE_PERCENTAGE = 0.01; // 1%

export const MIN_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE = 0.4; // 40%
export const MAX_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE = 0.05; // 5%

export const DEFAULT_PRICE_SLIPPAGES_PERCENTAGE = [0.005, 0.01]; // [0.5%, 1%]
export const DEFAULT_MAX_CREATOR_DELAY_TIME_SEC = 15;
