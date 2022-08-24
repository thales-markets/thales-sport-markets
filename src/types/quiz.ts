export type LeaderboardItem = {
    wallet: string;
    name: string;
    points: number;
    avatar: string;
    finishTime: string;
    rank: string;
    rewards: number;
};

export type LeaderboardList = LeaderboardItem[];
