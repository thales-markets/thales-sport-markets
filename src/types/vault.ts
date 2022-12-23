import { VaultTradeStatus } from 'constants/vault';
import { SportMarketInfo } from './markets';

export type VaultData = {
    round: number;
    roundEndTime: number;
    vaultStarted: boolean;
    maxAllowedDeposit: number;
    allocationCurrentRound: number;
    allocationNextRound: number;
    availableAllocationNextRound: number;
    allocationNextRoundPercentage: number;
    isRoundEnded: boolean;
    minDepositAmount: number;
    maxAllowedUsers: number;
    usersCurrentlyInVault: number;
    canCloseCurrentRound: boolean;
    paused: boolean;
    lifetimePnl: number;
    utilizationRate: number;
    priceLowerLimit: number;
    priceUpperLimit: number;
    skewImpactLimit: number;
    allocationLimitsPerMarketPerRound: number;
    minTradeAmount: number;
    allocationSpentInARound: number;
    availableAllocationInARound: number;
    roundLength: number;
};

export type UserVaultData = {
    balanceCurrentRound: number;
    balanceNextRound: number;
    balanceTotal: number;
    isWithdrawalRequested: boolean;
    hasDepositForCurrentRound: boolean;
    hasDepositForNextRound: boolean;
};

export type UserVaultsData = {
    balanceTotal: number;
};

export type VaultTrade = {
    hash: string;
    timestamp: number;
    amount: number;
    paid: number;
    blockNumber: number;
    position: number;
    market: string;
    game: string;
    result: number;
    wholeMarket: SportMarketInfo;
    status: VaultTradeStatus;
    round: number;
};

export type VaultTrades = VaultTrade[];

export type VaultPnlPerRound = {
    round: number | string;
    pnl: number;
};

export type VaultPnls = VaultPnlPerRound[];

export type VaultUserTransaction = {
    hash: string;
    timestamp: number;
    blockNumber: number;
    type: string;
    account: string;
    amount: number;
    round: number;
};

export type VaultUserTransactions = VaultUserTransaction[];
