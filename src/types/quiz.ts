export type LeaderboardItem = {
    wallet: string;
    name: string;
    points: number;
    avatar: string;
    finishTime: number;
    ranking: number;
    price: number;
};

export type LeaderboardList = LeaderboardItem[];

export type WeeklyLeaderboard = {
    week: number;
    weekStart: Date;
    weekEnd: Date;
    leaderboard: LeaderboardList;
};

export type LeaderboardByWeeks = WeeklyLeaderboard[];

export type FinishInfo = {
    rank: number;
    points: number;
    totalParticipants: number;
};
