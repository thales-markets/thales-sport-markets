import { Coins } from 'thales-utils';

export type LiquidityPoolData = {
    collateral: string;
    liquidityPoolStarted: boolean;
    maxAllowedDeposit: number;
    round: number;
    roundEndTime: number;
    allocationNextRound: number;
    allocationNextRoundPercentage: number;
    availableAllocationNextRound: number;
    allocationCurrentRound: number;
    isRoundEnded: boolean;
    minDepositAmount: number;
    maxAllowedUsers: number;
    usersCurrentlyInLiquidityPool: number;
    canCloseCurrentRound: boolean;
    paused: boolean;
    roundLength: number;
    lifetimePnl: number;
};

export type UserLiquidityPoolData = {
    balanceCurrentRound: number;
    balanceNextRound: number;
    balanceTotal: number;
    isWithdrawalRequested: boolean;
    hasDepositForCurrentRound: boolean;
    hasDepositForNextRound: boolean;
    withdrawalShare: number;
    isPartialWithdrawalRequested: boolean;
    withdrawalAmount: number;
};

type LiquidityPoolPnlPerRound = {
    round: number | string;
    pnlPerRound: number;
    cumulativePnl: number;
};

export type LiquidityPoolPnls = LiquidityPoolPnlPerRound[];

export type LiquidityPoolUserTransaction = {
    hash: string;
    timestamp: number;
    blockNumber: number;
    liquidityPool: string;
    name: string;
    type: string;
    account: string;
    amount: number;
    round: number;
    collateral: Coins;
};

export type LiquidityPoolUserTransactions = LiquidityPoolUserTransaction[];

export type LiquidityPoolReturn = {
    arr: number;
    apr: number;
    apy: number;
};

export type LiquidityPool = {
    name: string;
    address: string;
    collateral: Coins;
};

export type LiquidityPoolTicketData = {
    round: number;
    indexInRound: number;
    foundInRound: boolean;
};
