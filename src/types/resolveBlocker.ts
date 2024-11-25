import { SportMarket } from './markets';

export type BlockedGame = {
    game: SportMarket;
    reason: string;
    isBlocked: boolean;
};

export type BlockedGames = BlockedGame[];
