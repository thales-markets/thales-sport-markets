import { NetworkId } from 'types/network';
import { Position } from './options';

export const QUERY_KEYS = {
    Rewards: (networkId: NetworkId, period: number) => ['rewards', networkId, period],
    Markets: (networkId: NetworkId) => ['markets', networkId],
    ParlayMarkets: (networkId: NetworkId, account: string) => ['parlayMarkets', networkId, account],
    ParlayLeaderboard: (networkId: NetworkId, period: number) => ['parlayLeaderboard', period, networkId],
    SportMarkets: (networkId: NetworkId) => ['sportMarkets', networkId],
    SportMarketsNew: (networkId: NetworkId) => ['sportMarketsNew', networkId],
    ParlayAmmData: (networkId: NetworkId) => ['parlayAmmData', networkId],
    Market: (marketAddress: string) => ['market', marketAddress],
    LiveResult: (marketId: string) => ['liveResult', marketId],
    ChildMarkets: (marketAddress: string) => ['childMarkets', marketAddress],
    PositionDetails: (
        marketAddress: string,
        position: Position,
        amount: number,
        stableIndex: number,
        networkId: NetworkId
    ) => ['positionDetails', marketAddress, position, amount, stableIndex, networkId],
    AvailablePerPosition: (marketAddress: string) => ['availablePerPosition', marketAddress],
    AvailablePerDoubleChancePosition: (marketAddress: string) => ['availablePerDoubleChancePosition', marketAddress],
    MarketTransactions: (marketAddress: string, networkId: NetworkId, walletAddress?: string) => [
        'market',
        'transactions',
        marketAddress,
        networkId,
        walletAddress,
    ],
    MarketDuration: (networkId: NetworkId) => ['marketDuration', networkId],
    UserTransactions: (walletAddress: string, networkId: NetworkId) => [
        'user',
        'transactions',
        walletAddress,
        networkId,
    ],
    WinningInfo: (walletAddress: string, networkId: NetworkId) => ['user', 'winningInfo', walletAddress, networkId],
    ClaimTx: (market: string, networkId: NetworkId) => ['claim', 'transactions', market, networkId],
    ClaimableCount: (walletAddress: string, networkId: NetworkId) => [
        'claimable',
        'count',
        'notification',
        walletAddress,
        networkId,
    ],
    AccountPositions: (walletAddress: string, networkId: NetworkId) => ['positions', walletAddress, networkId],
    AccountPositionsProfile: (walletAddress: string, networkId: NetworkId) => [
        'accountPosition',
        walletAddress,
        networkId,
    ],
    ReferralTransaction: (walletAddress: string, networkId: NetworkId) => [
        'referralTransaction',
        walletAddress,
        networkId,
    ],
    Referrers: (networkId: NetworkId) => ['referrers', networkId],
    ReferredTraders: (walletAddress: string, networkId: NetworkId) => ['referredTraders', walletAddress, networkId],
    ReferralOverview: (walletAddress: string, networkId: NetworkId) => ['referralOverview', walletAddress, networkId],
    Wallet: {
        GetsUSDWalletBalance: (walletAddress: string, networkId: NetworkId) => [
            'sUsd',
            'balance',
            walletAddress,
            networkId,
        ],
        TokenBalance: (token: string, walletAddress: string, networkId: NetworkId) => [
            'wallet',
            'tokenBalance',
            token,
            walletAddress,
            networkId,
        ],
        MultipleCollateral: (walletAddress: string, networkId: NetworkId) => [
            'multipleCollateral',
            walletAddress,
            networkId,
        ],
        GetUsdDefaultAmount: (networkId: NetworkId) => ['wallet', 'getUsdDefaultAmount', networkId],
        OvertimeVoucher: (walletAddress: string, networkId: NetworkId) => [
            'wallet',
            'overtimeVoucher',
            walletAddress,
            networkId,
        ],
        Stats: (networkId: NetworkId, walletAddress: string) => ['wallet', 'stats', networkId, walletAddress],
    },
    Quiz: {
        Leaderboard: () => ['quiz', 'leaderboard'],
        Tweet: () => ['quiz', 'tweet'],
    },
    FavoriteTeam: (walletAddress: string, networkId: NetworkId) => ['favoriteTeam', walletAddress, networkId],
    Zebro: (networkId: NetworkId) => ['zebro', networkId],
    Vault: {
        Data: (vaultAddress: string, networkId: NetworkId) => [vaultAddress, 'data', networkId],
        UserData: (vaultAddress: string, walletAddress: string, networkId: NetworkId) => [
            vaultAddress,
            'data',
            walletAddress,
            networkId,
        ],
        AllVaultsUserData: (walletAddress: string, networkId: NetworkId) => ['data', walletAddress, networkId],
        Trades: (vaultAddress: string, networkId: NetworkId) => [vaultAddress, 'trades', networkId],
        PnL: (vaultAddress: string, networkId: NetworkId) => [vaultAddress, 'pnl', networkId],
        UserTransactions: (vaultAddress: string, networkId: NetworkId) => [vaultAddress, 'userTransactions', networkId],
    },
    Bungee: {
        Tokens: () => ['bungee', 'tokens'],
    },
};

export default QUERY_KEYS;
