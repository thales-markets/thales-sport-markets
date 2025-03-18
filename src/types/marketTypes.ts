import { Sport } from 'overtime-utils';

export type SelectedMarket = {
    gameId: string;
    sport: Sport;
    live?: boolean;
    playerName?: string;
};
