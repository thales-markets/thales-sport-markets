import { PositionName } from 'constants/options';
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
};

export type UserVaultData = {
    balanceCurrentRound: number;
    balanceNextRound: number;
    balanceTotal: number;
    isWithdrawalRequested: boolean;
    hasDepositForCurrentRound: boolean;
    hasDepositForNextRound: boolean;
};

export type VaultTrade = {
    hash: string;
    timestamp: number;
    amount: number;
    paid: number;
    blockNumber: number;
    position: PositionName;
    positionTeam: string;
    market: string;
    game: string;
    result: PositionName;
    wholeMarket: SportMarketInfo;
    status: VaultTradeStatus;
};

export type VaultTrades = VaultTrade[];

export type VaultPnlPerRound = {
    round: number | string;
    pnl: number;
};

export type VaultPnls = VaultPnlPerRound[];
