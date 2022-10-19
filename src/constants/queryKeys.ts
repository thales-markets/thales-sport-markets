import { SportMarketInfo } from 'types/markets';
import { NetworkId } from 'types/network';
import { Position, Side } from './options';

export const QUERY_KEYS = {
    Rewards: (networkId: NetworkId, period: number) => ['rewards', networkId, period],
    Markets: (networkId: NetworkId) => ['markets', networkId],
    SportMarkets: (networkId: NetworkId) => ['sportMarkets', networkId],
    OpenSportMarkets: (networkId: NetworkId) => ['openSportMarkets', networkId],
    CanceledSportMarkets: (networkId: NetworkId) => ['canceledSportMarkets', networkId],
    ResolvedSportMarkets: (networkId: NetworkId) => ['resolvedSportMarkets', networkId],
    Market: (marketAddress: string, isSell: boolean) => ['market', marketAddress, isSell],
    MarketBalances: (marketAddress: string, walletAddress: string) => ['marketBalances', marketAddress, walletAddress],
    MarketCancellationOdds: (marketAddress: string) => ['marketCancellationOdds', marketAddress],
    PositionDetails: (
        marketAddress: string,
        position: Position,
        amount: number,
        stableIndex: number,
        networkId: NetworkId
    ) => ['positionDetails', marketAddress, position, amount, stableIndex, networkId],
    AvailablePerSide: (marketAddress: string, side: Side) => ['availablePerSide', marketAddress, side],
    MarketTransactions: (marketAddress: string, networkId: NetworkId) => [
        'market',
        'transactions',
        marketAddress,
        networkId,
    ],
    UserTransactions: (walletAddress: string, networkId: NetworkId) => [
        'user',
        'transactions',
        walletAddress,
        networkId,
    ],
    ClaimTx: (market: string, networkId: NetworkId) => ['claim', 'transactions', market, networkId],
    UserTransactionsPerMarket: (walletAddress: string, marketAddress: string, networkId: NetworkId) => [
        'user',
        'market',
        'transactions',
        walletAddress,
        marketAddress,
        networkId,
    ],
    AccountMarketData: (marketAddress: string, walletAddress: string) => ['market', marketAddress, walletAddress],
    AccountMarketTicketData: (marketAddress: string, walletAddress: string) => [
        'market',
        'ticket',
        marketAddress,
        walletAddress,
    ],
    AccountMarketOpenBidData: (marketAddress: string, walletAddress: string) => [
        'market',
        'openBid',
        marketAddress,
        walletAddress,
    ],
    MarketsParameters: (networkId: NetworkId) => ['markets', 'parameters', networkId],
    Tags: (networkId: NetworkId) => ['tags', networkId],
    NormalizedOdds: (sportMarket: SportMarketInfo, networkId: NetworkId) => ['normalizedOdds', sportMarket, networkId],
    AccountPositions: (walletAddress: string, networkId: NetworkId) => ['positions', walletAddress, networkId],
    DiscountMarkets: (networkId: NetworkId) => ['discountMarkets', networkId],
    Wallet: {
        PaymentTokenBalance: (walletAddress: string, networkId: NetworkId) => [
            'wallet',
            'paymentTokenBalance',
            walletAddress,
            networkId,
        ],
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
        SwapApproveSpender: (networkId: NetworkId) => ['wallet', 'swap', 'approveSpender', networkId],
        GetUsdDefaultAmount: (networkId: NetworkId) => ['wallet', 'getUsdDefaultAmount', networkId],
        OvertimeVoucher: (walletAddress: string, networkId: NetworkId) => [
            'wallet',
            'overtimeVoucher',
            walletAddress,
            networkId,
        ],
    },
    Quiz: {
        Leaderboard: () => ['quiz', 'leaderboard'],
        Tweet: () => ['quiz', 'tweet'],
    },
};

export default QUERY_KEYS;
