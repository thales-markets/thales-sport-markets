export type OverdropMultiplier = {
    multiplier: number;
    name: string;
    label?: string;
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
