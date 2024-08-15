export type OverdropMultiplier = {
    multiplier: number;
    name: string;
    label?: string;
    icon?: JSX.Element;
};

export type OverdropUserData = {
    address: string;
    points: number;
    volume: number;
    rewards: {
        op: number;
        arb: number;
    };
    rank: number;
};

export type OverdropXPHistory = {
    timestamp: number;
    points: number;
    txHash: string;
};

export type LeaderboardRow = OverdropUserData & {
    rank: number;
    reards: {
        op: number;
        arb: number;
    };
};

export enum MultiplierType {
    DAILY = 'dailyMultiplier',
    WEEKLY = 'weeklyMultiplier',
    TWITTER = 'twitterMultiplier',
}

export enum ModalTypes {
    WELCOME,
    LEVEL_UP,
    DAILY_STREAK,
}
