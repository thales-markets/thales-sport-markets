export type PositionName = 'HOME' | 'AWAY' | 'DRAW';

export enum Position {
    HOME = 0,
    AWAY = 1,
    DRAW = 2,
}

export enum Side {
    BUY = 'BUY',
    SELL = 'SELL',
}

export const POSITION_MAP: Record<PositionName, string> = {
    HOME: '1',
    DRAW: 'X',
    AWAY: '2',
};

export const APEX_TOP_GAME_POSITION_MAP: Record<string, string> = {
    HOME: 'yes',
    AWAY: 'no',
};

export enum DenominationType {
    TOKEN = 'TOKEN',
    USD = 'USD',
}

export const MAX_L2_GAS_LIMIT = 15000000;
