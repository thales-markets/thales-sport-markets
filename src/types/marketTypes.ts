import { MarketType } from 'enums/marketTypes';
import { Sport } from 'enums/sports';

export type MarketTypeInfo = {
    id: MarketType;
    key: string;
    name: string;
    shortName?: string;
    description?: string;
    tooltipKey?: string;
};

export type SelectedMarket = {
    gameId: string;
    sport: Sport;
    live?: boolean;
    playerName?: string;
};
