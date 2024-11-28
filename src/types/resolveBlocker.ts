export type BlockedGame = {
    timestamp: number;
    gameId: string;
    homeTeam: string;
    awayTeam: string;
    reason: string;
    isUnblocked: boolean;
};

export type BlockedGames = BlockedGame[];
