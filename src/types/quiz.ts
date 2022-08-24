export type LeaderboardItem = {
    wallet: string;
    name: string;
    points: number;
    avatar: string;
    finishTime: string;
    position: string;
};

export type LeaderboardList = LeaderboardItem[];
