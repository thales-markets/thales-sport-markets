import { SpeedPositions } from 'enums/speedMarkets';
import { CRYPTO_CURRENCY_MAP } from './currency';
import { MARKET_DURATION_IN_DAYS } from './markets';

export const SUPPORTED_ASSETS = [CRYPTO_CURRENCY_MAP.BTC, CRYPTO_CURRENCY_MAP.ETH];
export const DELTA_TIMES_MINUTES = [3, 5];

export const POSITIONS_TO_SIDE_MAP: Record<SpeedPositions, number> = {
    UP: 0,
    DOWN: 1,
};

export const SIDE_TO_POSITION_MAP: Record<number, SpeedPositions> = {
    0: SpeedPositions.UP,
    1: SpeedPositions.DOWN,
};

export const SPEED_MARKETS_QUOTE = 2;
export const MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH = 3000;
export const BATCH_NUMBER_OF_SPEED_MARKETS = 1000;

export const BICONOMY_MAX_FEE_PERCENTAGE = 0.01; // 1%

export const MIN_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE = 0.4; // 40%
export const MAX_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE = 0.05; // 5%

export const DEFAULT_PRICE_SLIPPAGES_PERCENTAGE = [0.001, 0.005, 0.01, 0.02]; // [0.1%, 0.5%, 1%, 2%]
export const DEFAULT_MAX_CREATOR_DELAY_TIME_SEC = 15;

const TODAY = new Date();
// show history for 90 days in the past
export const MIN_MATURITY = Math.round(
    new Date(new Date().setDate(TODAY.getDate() - MARKET_DURATION_IN_DAYS)).getTime() / 1000
);
