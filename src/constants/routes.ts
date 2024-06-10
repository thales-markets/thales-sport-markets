import { MetaRoutes } from 'enums/routes';

const ROUTES = {
    Home: '/',
    Markets: {
        Home: '/markets',
        Market: '/markets/:marketAddress',
    },
    Profile: '/profile',
    Referral: '/referral',
    Quiz: '/trivia',
    QuizLeaderboard: '/trivia/leaderboard',
    Wizard: '/wizard',
    Vaults: '/vaults',
    Vault: '/vaults/:vaultId',
    Leaderboard: '/parlay-leaderboard',
    LiquidityPool: '/liquidity-pool',
    SingleLiquidityPool: '/liquidity-pool?pool-type=single',
    ParlayLiquidityPool: '/liquidity-pool?pool-type=parlay',
    Deposit: '/deposit',
    Withdraw: '/withdraw',
    Promotions: {
        Home: '/promotions',
        Promotion: '/promotions/:promotionId',
    },
};

export const PAGE_NAME_TO_META_DATA_KEYS: {
    [page in MetaRoutes]: { title: string; description: string; hasCustomData?: boolean };
} = {
    [MetaRoutes.Home]: {
        title: 'seo.home.title',
        description: 'seo.home.description',
    },
    [MetaRoutes.Markets]: {
        title: 'seo.markets.title',
        description: 'seo.markets.description',
    },
    [MetaRoutes.Vaults]: {
        title: 'seo.vaults.title',
        description: 'seo.vaults.description',
    },
    [MetaRoutes.ParlayLeaderboard]: {
        title: 'seo.parlay-leaderboard.title',
        description: 'seo.parlay-leaderboard.description',
    },
    [MetaRoutes.Referral]: {
        title: 'seo.referral.title',
        description: 'seo.referral.description',
    },
    [MetaRoutes.Profile]: {
        title: 'seo.profile.title',
        description: 'seo.profile.description',
    },
    [MetaRoutes.LiquidityPool]: {
        title: 'seo.liquidity-pool.title',
        description: 'seo.liquidity-pool.description',
    },
    [MetaRoutes.SingleMarket]: {
        title: 'seo.single-market.title',
        description: 'seo.single-market.description',
        hasCustomData: true,
    },
};

export const API_ROUTES = {
    CacheControl: 'v1/cache-control',
    LP: 'v1/sport-markets/liquidity-providing',
    LPPnls: 'v1/sport-markets/liquidity-providing/pnl',
    LPTransactions: 'v1/sport-markets/liquidity-providing/transactions',

    Transactions: 'v1/sport-markets/transactions',
    PositionBalance: 'v1/sport-markets/transactions/position-balance',
    Parlays: 'v1/sport-markets/transactions/parlays',
    ClaimTxes: 'v1/sport-markets/transactions/claim',

    MarketsList: 'v1/sport-markets/markets/list',
    RangeMarketsList: 'v1/sport-markets/markets/ranged',

    Referral: 'v1/sport-markets/referral',
    ReferralTransactions: 'v1/sport-markets/referral/transactions',
    ReferralTraders: 'v1/sport-markets/referral/traders',
    Referrers: 'v1/sport-markets/referral/referrers',

    VaultsUserTransactions: 'v1/sport-markets/vaults/user-transactions',
    VaultsPnl: 'v1/sport-markets/vaults/pnl',
    VaultsTransactions: 'v1/sport-markets/vaults/transactions',
};

export default ROUTES;

export const RESET_STATE = 'reset';
