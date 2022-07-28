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

export const MAX_L2_GAS_LIMIT = 15000000;
