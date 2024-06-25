export const CACHE_PREFIX_KEYS = {
    Stakers: 'stakers-',
    ClaimOnBehalfItems: 'claim-on-behalf',
    TokenTransactions: 'token-transactions',
    DigitalOptions: {
        LiquidityPoolPnl: 'digital-options-liquidity-pool-pnl-',
        LiquidityPoolTransactions: 'digital-options-liquidity-pool-tx-',

        Markets: 'digital-options-markets-',
        RangedMarkets: 'digital-options-ranged-markets',

        Trades: 'digital-options-trades-',
        OptionTransactions: 'digital-options-option-transactions-',
        PositionBalance: 'digital-options-position-balance',
        RangePositionBalance: 'digital-options-range-position-balance',

        ReferralTransactions: 'digital-options-referral-transactions',
        ReferredTraders: 'digital-options-referred-traders',
        Referrers: 'digital-options-referrers',

        VaultUserTransactions: 'digital-options-vault-user-transactions',
        VaultPnl: 'digital-options-vault-pnl',
        VaultTransactions: 'digital-options-vault-transactions',
    },
    SportsMarkets: {
        LiquidityPoolPnl: 'sports-markets-liquidity-pool-pnl-',
        LiquidityPoolTransactions: 'sports-markets-liquidity-pool-tx-',

        Markets: 'sports-markets-market-list',

        ReferralTransactions: 'sports-markets-referral-transactions',
        ReferredTraders: 'sports-markets-referred-traders',
        Referrers: 'sports-markets-referrers',

        PositionBalance: 'sports-markets-position-balance',
        Transactions: 'sports-markets-transactions',
        Parlay: 'sport-markets-parlays',
        ClaimTxs: 'sport-markets-claim-transactions',

        VaultUserTransactions: 'sports-markets-vault-user-transactions',
        VaultPnl: 'sports-markets-vault-pnl',
        VaultTransactions: 'sports-markets-vault-transactions',
        ParlayVaultTransactions: 'sports-markets-vault-transactions',

        Vouchers: 'sport-markets-vouchers',

        UserStats: 'sport-markets-user-stats',
    },
};

export const WAIT_PERIOD_AFTER_CACHE_INVALIDATION_IN_SECONDS = 11;
