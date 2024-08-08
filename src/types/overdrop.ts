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
