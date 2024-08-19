import { Network } from 'enums/network';

export type OverdropMultiplier = {
    multiplier: number;
    name: string;
    label?: string;
    icon?: JSX.Element;
    tooltip?: string;
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
    lastTwitterActivity: number;
};

export type OverdropXPHistory = {
    timestamp: number;
    points: number;
    txHash: string;
    network: Network;
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
    LOYALTY = 'loyaltyMultiplier',
    GAME = 'gameMultiplier',
}

export enum ModalTypes {
    WELCOME,
    LEVEL_UP,
    DAILY_STREAK,
}
export enum GameMultiplierType {
    DAILY = 'daily',
    WEEKLY = 'weekly',
}

export type GameMultiplier = {
    gameId: `0x${string}`;
    multiplier: string;
    type: GameMultiplierType;
};

export type OverdropUIState = {
    walletAddress: string;
    dailyMultiplier: number;
    currentLevel: number;
    welcomeModalFlag: boolean;
    preventShowingDailyModal: boolean;
};
