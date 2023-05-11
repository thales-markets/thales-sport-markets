export type LiquidityPoolData = {
    round: number;
    roundEndTime: number;
    liquidityPoolStarted: boolean;
    maxAllowedDeposit: number;
    allocationCurrentRound: number;
    allocationNextRound: number;
    availableAllocationNextRound: number;
    allocationNextRoundPercentage: number;
    isRoundEnded: boolean;
    minDepositAmount: number;
    maxAllowedUsers: number;
    usersCurrentlyInLiquidityPool: number;
    canCloseCurrentRound: boolean;
    paused: boolean;
    lifetimePnl: number;
    roundLength: number;
    stakedThalesMultiplier: number;
};

export type UserLiquidityPoolData = {
    balanceCurrentRound: number;
    balanceNextRound: number;
    balanceTotal: number;
    isWithdrawalRequested: boolean;
    hasDepositForCurrentRound: boolean;
    hasDepositForNextRound: boolean;
    stakedThales: number;
    maxDeposit: number;
    availableToDeposit: number;
    withdrawalShare: number;
    isPartialWithdrawalRequested: boolean;
    withdrawalAmount: number;
};

export type UserLiquidityPoolsData = {
    balanceTotal: number;
};

export type LiquidityPoolPnlPerRound = {
    round: number | string;
    pnlPerRound: number;
    cumulativePnl: number;
};

export type LiquidityPoolPnls = LiquidityPoolPnlPerRound[];

export type LiquidityPoolUserTransaction = {
    hash: string;
    timestamp: number;
    blockNumber: number;
    type: string;
    account: string;
    amount: number;
    round: number;
};

export type LiquidityPoolUserTransactions = LiquidityPoolUserTransaction[];

export type VaultsAndLiquidityPoolUserTransaction = {
    name: string;
    hash: string;
    timestamp: number;
    blockNumber: number;
    type: string;
    account: string;
    amount: number;
    round: number;
};

export type VaultsAndLiquidityPoolUserTransactions = VaultsAndLiquidityPoolUserTransaction[];
