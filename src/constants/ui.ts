import { Network } from 'enums/network';
import { ProfileTab, Theme } from 'enums/ui';
import darkTheme from 'styles/themes/dark';
import { NavMenuItem, ThemeInterface } from 'types/ui';
import { LINKS } from './links';
import ROUTES from './routes';

export const ThemeMap: Record<Theme, ThemeInterface> = {
    [Theme.DARK]: darkTheme,
};

export const NAV_MENU_FIRST_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.profile',
        iconClass: 'icon icon--profile2',
        name: 'profile',
        route: `${ROUTES.Profile}?selected-tab=${ProfileTab.OPEN_CLAIMABLE}`,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.Base, Network.OptimismSepolia],
    },
    {
        i18label: 'markets.nav-menu.items.account',
        iconClass: 'icon icon--logo',
        name: 'account',
        route: ROUTES.Profile,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.Base, Network.OptimismSepolia],
    },
    {
        i18label: 'markets.nav-menu.items.resolve-blocker',
        iconClass: 'icon icon--cross-button',
        name: 'resolve-blocker',
        route: ROUTES.ResolveBlocker,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.Base, Network.OptimismSepolia],
    },
];

export const NAV_MENU_SECOND_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.markets',
        iconClass: 'icon icon--logo',
        name: 'markets',
        route: ROUTES.Markets.Home,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.Base, Network.OptimismSepolia],
    },
    {
        i18label: 'markets.nav-menu.items.liquidity-pool',
        iconClass: 'icon icon--liquidity-pool',
        name: 'liquidity-pool',
        route: ROUTES.LiquidityPool,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.Base, Network.OptimismSepolia],
    },
];

export const NAV_MENU_THIRD_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.promotions',
        iconClass: 'icon icon--promotions',
        name: 'promotions',
        route: ROUTES.Promotions.Home,
        supportedNetworks: [Network.OptimismMainnet, Network.Arbitrum, Network.Base, Network.OptimismSepolia],
    },
];

export const NAV_MENU_FOURTH_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.speed-markets',
        iconClass: 'sidebar-icon sidebar-icon--speed-markets',
        name: 'speed-markets',
        route: LINKS.SpeedMarkets,
        supportedNetworks: [Network.OptimismMainnet, Network.OptimismSepolia, Network.Arbitrum, Network.Base],
    },
    {
        i18label: 'markets.nav-menu.items.digital-options',
        iconClass: 'sidebar-icon sidebar-icon--markets',
        name: 'digital-options',
        route: LINKS.Thales,
        supportedNetworks: [Network.OptimismMainnet, Network.OptimismSepolia, Network.Arbitrum, Network.Base],
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

export const MAIN_VIEW_RIGHT_CONTAINER_WIDTH_LARGE = '360px';
export const MAIN_VIEW_RIGHT_CONTAINER_WIDTH_MEDIUM = '320px';

export const NAV_MENU_WIDTH = 255;
export const DISCORD_WIDGET_DEFAULT_RIGHT = 20;
export const SPEED_MARKETS_WIDGET_DEFAULT_RIGHT = 86;
export const SPEED_MARKETS_WIDGET_Z_INDEX = 3000000000; // discord has 2147483000
