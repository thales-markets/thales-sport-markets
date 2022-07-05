import { SportMarketInfo } from 'types/markets';
import { NetworkId } from 'types/network';
import { Position } from './options';

export const QUERY_KEYS = {
    Markets: (networkId: NetworkId) => ['markets', networkId],
    SportMarkets: (networkId: NetworkId) => ['sportMarkets', networkId],
    Market: (marketAddress: string) => ['market', marketAddress],
    MarketBalances: (marketAddress: string, walletAddress: string) => ['marketBalances', marketAddress, walletAddress],
    MarketCancellationOdds: (marketAddress: string) => ['marketCancellationOdds', marketAddress],
    PositionDetails: (marketAddress: string, position: Position, amount: number) => [
        'positionDetails',
        marketAddress,
        position,
        amount,
    ],
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
    Wallet: {
        PaymentTokenBalance: (walletAddress: string, networkId: NetworkId) => [
            'wallet',
            'paymentTokenBalance',
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
    },
};

export default QUERY_KEYS;
