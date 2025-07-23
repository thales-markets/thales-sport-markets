import { Network } from 'enums/network';
import { GameMultiplierType } from 'enums/overdrop';

export type OverdropMultiplier = {
    multiplier: number;
    name: string;
    label?: string;
    icon?: JSX.Element;
    tooltip?: string;
};

export enum RewardType {
    XP_BOOST = 'XP_BOOST',
    OVERDROP_XP = 'OVERDROP_XP',
}

export type Reward = {
    type: RewardType;
    amount: number;
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
    lastTwitterActivity?: number;
    lastTradeOvertime?: number;
    lastTradeSpeed?: number;
    wheel?: {
        lastSpinTime?: number;
        reward?: Reward;
    };
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

export type GameMultiplier = {
    gameId: `0x${string}`;
    multiplier: string;
    type: GameMultiplierType;
};

export type OverdropUIState = {
    walletAddress: string;
    dailyMultiplier: number;
    currentLevel: number;
};

export type UserRewards = {
    walletAddress: string;
    amount: number;
    rawAmount: string;
    hasRewards: boolean;
    hasClaimed: boolean;
    proof: string[];
};

export type SpinThewheelOption = {
    id: number;
    min: number;
    max: number;
    type: RewardType;
    amount: number;
    bonus?: boolean;
};
