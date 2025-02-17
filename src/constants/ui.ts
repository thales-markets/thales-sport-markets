import { Network } from 'enums/network';
import { Theme } from 'enums/ui';
import darkTheme from 'styles/themes/dark';
import marchMadnessTheme from 'styles/themes/marchMadness';
import { NavMenuItem, ThemeInterface } from 'types/ui';
import { LINKS } from './links';
import ROUTES from './routes';

export const ThemeMap: Record<Theme, ThemeInterface> = {
    [Theme.DARK]: darkTheme,
    [Theme.MARCH_MADNESS]: marchMadnessTheme,
};

export const NAV_MENU_FIRST_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.profile',
        iconClass: 'icon icon--profile2',
        name: 'profile',
        route: ROUTES.Profile,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.OptimismSepolia],
    },
    {
        i18label: 'markets.nav-menu.items.resolve-blocker',
        iconClass: 'icon icon--cross-button',
        name: 'resolve-blocker',
        route: ROUTES.ResolveBlocker,
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
        i18label: 'markets.nav-menu.labels.march-madness',
        iconClass: 'icon icon--brackets',
        name: 'march-madness',
        route: ROUTES.MarchMadness,
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
        i18label: 'markets.nav-menu.items.promotions',
        iconClass: 'icon icon--promotions',
        name: 'promotions',
        route: ROUTES.Promotions.Home,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.OptimismSepolia],
    },
];

export const NAV_MENU_FOURTH_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.speed-markets',
        iconClass: 'sidebar-icon sidebar-icon--speed-markets',
        name: 'speed-markets',
        route: LINKS.SpeedMarkets,
        supportedNetworks: [Network.OptimismMainnet, Network.OptimismSepolia, Network.Arbitrum],
    },
    {
        i18label: 'markets.nav-menu.items.digital-options',
        iconClass: 'sidebar-icon sidebar-icon--markets',
        name: 'digital-options',
        route: LINKS.Thales,
        supportedNetworks: [Network.OptimismMainnet, Network.OptimismSepolia, Network.Arbitrum],
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

export const SEO_ARTICLES_PER_PAGE = 12;

const STAKING_MODAL_MUTE_PERIOD_IN_DAYS = 7;
export const STAKING_MODAL_MUTE_PERIOD_IN_MS = STAKING_MODAL_MUTE_PERIOD_IN_DAYS * 24 * 60 * 60 * 1000;
