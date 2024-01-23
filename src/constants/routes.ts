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

export default ROUTES;

export const RESET_STATE = 'reset';
