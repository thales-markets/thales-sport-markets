export type LeaderboardItem = {
    wallet: string;
    name: string;
    points: number;
    avatar: string;
    finishTime: number;
    rank: number;
    rewards: number;
};

export type LeaderboardList = LeaderboardItem[];

export type FinishInfo = {
    rank: number;
    points: number;
    totalParticipants: number;
    lastRankPointsWithRewards: number;
    isQualifiedForRewards: boolean;
};
