export type VaultData = {
    round: number;
    roundStartTime: number;
    roundEndTime: number;
    vaultStarted: boolean;
    maxAllowedDeposit: number;
    allocationNextRound: number;
    allocationNextRoundPercentage: number;
};

export type UserVaultData = {
    balanceCurrentRound: number;
    balanceNextRound: number;
    balanceTotal: number;
    isWithdrawalRequested: boolean;
    withdrawalAmount: number;
};
