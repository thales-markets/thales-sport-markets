export type BlockedGame = {
    timestamp: number;
    gameId: string;
    homeTeam: string;
    awayTeam: string;
    reason: string;
    isUnblocked: boolean;
    unblockedBy: string;
    hash: string;
};

export type BlockedGames = BlockedGame[];
