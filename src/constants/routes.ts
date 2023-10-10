import { Page } from 'types/ui';

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
};

export const PAGE_NAME_TO_META_DATA_KEYS: { [page in Page]: { title: string; description: string } } = {
    Home: {
        title: 'seo.home.title',
        description: 'seo.home.description',
    },
    Markets: {
        title: 'seo.markets.title',
        description: 'seo.markets.description',
    },
    Vaults: {
        title: 'seo.vaults.title',
        description: 'seo.vaults.description',
    },
    ParlayLeaderboard: {
        title: 'seo.parlay-leaderboard.title',
        description: 'seo.parlay-leaderboard.description',
    },
    Referral: {
        title: 'seo.referral.title',
        description: 'seo.referral.description',
    },
    Profile: {
        title: 'seo.profile.title',
        description: 'seo.profile.description',
    },
    LiquidityPool: {
        title: 'seo.liquidity-pool.title',
        description: 'seo.liquidity-pool.description',
    },
};

export default ROUTES;

export const RESET_STATE = 'reset';
