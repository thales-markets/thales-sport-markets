import { Network } from 'enums/network';
import { Theme } from 'enums/ui';
import darkTheme from 'styles/themes/dark';
import { NavMenuItem, ThemeInterface } from 'types/ui';
import ROUTES from './routes';

export const ThemeMap: Record<Theme, ThemeInterface> = {
    [Theme.DARK]: darkTheme,
};

export const NAV_MENU_FIRST_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.profile',
        iconClass: 'icon icon--profile2',
        name: 'profile',
        route: ROUTES.Profile,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.OptimismSepolia],
    },
];

export const NAV_MENU_SECOND_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.markets',
        iconClass: 'icon icon--logo',
        name: 'markets',
        route: ROUTES.Markets.Home,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.OptimismSepolia],
    },
    {
        i18label: 'markets.nav-menu.items.liquidity-pool',
        iconClass: 'icon icon--liquidity-pool',
        name: 'liquidity-pool',
        route: ROUTES.LiquidityPool,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.OptimismSepolia],
    },
];

export const NAV_MENU_THIRD_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.leaderboard',
        iconClass: 'icon icon--competition',
        name: 'parlay-competition',
        route: ROUTES.Leaderboard,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum],
    },
    {
        i18label: 'markets.nav-menu.items.become-affiliate',
        iconClass: 'icon icon--affiliate',
        name: 'become-affiliate',
        route: ROUTES.Referral,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.OptimismSepolia],
    },
];

export const NAV_MENU_FOURTH_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.promotions',
        iconClass: 'icon icon--promotions',
        name: 'promotions',
        route: ROUTES.Promotions.Home,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.OptimismSepolia],
    },
];

export const NAV_MENU: NavMenuItem[] = [
    NAV_MENU_FIRST_SECTION,
    NAV_MENU_SECOND_SECTION,
    NAV_MENU_THIRD_SECTION,
    NAV_MENU_FOURTH_SECTION,
].flat();

export const PROMOTION_SANITIZE_PROPS = {
    ALLOWED_TAGS: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'span',
        'strong',
        'i',
        'u',
        'p',
        'a',
        'img',
        'ol',
        'ul',
        'li',
        'br',
        'hr',
    ],
    ALLOWED_ATTR: ['href', 'target', 'style', 'src', 'alt'],
};
