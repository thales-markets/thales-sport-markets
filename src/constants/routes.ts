import { MetaRoutes } from 'enums/routes';

const ROUTES = {
    Home: '/',
    Markets: {
        Home: '/markets',
        Market: '/markets/:marketAddress',
    },
    Profile: '/profile',
    Wizard: '/wizard',
    LiquidityPool: '/liquidity-pool',
    SingleLiquidityPool: '/liquidity-pool?pool-type=single',
    ParlayLiquidityPool: '/liquidity-pool?pool-type=parlay',
    Deposit: '/deposit',
    Withdraw: '/withdraw',
    Promotions: {
        Home: '/promotions',
        Promotion: '/promotions/:promotionId',
    },
    Ticket: '/tickets/:ticketAddress',
    Overdrop: '/overdrop',
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
