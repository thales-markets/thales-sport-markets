import { NetworkId } from 'types/network';

export const QUERY_KEYS = {
    Markets: (networkId: NetworkId) => ['markets', networkId],
    Market: (marketAddress: string) => ['market', marketAddress],
    MarketTransactions: (marketAddress: string, networkId: NetworkId) => [
        'market',
        'transactions',
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
    AccountPositions: (walletAddress: string, networkId: NetworkId) => ['positions', walletAddress, networkId],
    Wallet: {
        PaymentTokenBalance: (walletAddress: string, networkId: NetworkId) => [
            'wallet',
            'paymentTokenBalance',
            walletAddress,
            networkId,
        ],
        GetUsdDefaultAmount: (networkId: NetworkId) => ['wallet', 'getUsdDefaultAmount', networkId],
    },
    OracleCouncilMember: (walletAddress: string, networkId: NetworkId) => [
        'oracleCouncilMember',
        walletAddress,
        networkId,
    ],
};

export default QUERY_KEYS;
