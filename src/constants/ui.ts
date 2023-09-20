import { NavMenuItem, ThemeInterface } from 'types/ui';
import darkTheme from 'styles/themes/dark';
import ROUTES from './routes';
import { Theme } from 'enums/ui';
import { Network } from 'enums/network';

export const ThemeMap: Record<Theme, ThemeInterface> = {
    [Theme.DARK]: darkTheme,
};

export const GAME_STATUS = {
    FINAL: 'STATUS_FINAL',
    FULL_TIME: 'STATUS_FULL_TIME',
    HALF_TIME: 'STATUS_HALFTIME',
};

export const NAV_MENU_FIRST_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.profile',
        iconClass: 'icon icon--profile',
        name: 'profile',
        route: ROUTES.Profile,
        supportedNetworks: [Network.OptimismMainnet, Network.OptimismGoerli, Network.ArbitrumOne, Network.Base],
    },
];

export const NAV_MENU_SECOND_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.markets',
        iconClass: 'icon icon--logo',
        name: 'markets',
        route: ROUTES.Markets.Home,
        supportedNetworks: [Network.OptimismMainnet, Network.OptimismGoerli, Network.ArbitrumOne, Network.Base],
    },
    {
        i18label: 'markets.nav-menu.items.vaults',
        iconClass: 'icon icon--vaults',
        name: 'vaults',
        route: ROUTES.Vaults,
        supportedNetworks: [Network.OptimismMainnet, Network.OptimismGoerli, Network.ArbitrumOne],
    },
    {
        i18label: 'markets.nav-menu.items.liquidity-pool',
        iconClass: 'icon icon--liquidity-pool',
        name: 'liquidity-pool',
        route: ROUTES.LiquidityPool,
        supportedNetworks: [Network.OptimismMainnet, Network.OptimismGoerli, Network.ArbitrumOne, Network.Base],
    },
];

export const NAV_MENU_THIRD_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.leaderboard',
        iconClass: 'icon icon--competition',
        name: 'parlay-competition',
        route: ROUTES.Leaderboard,
        supportedNetworks: [Network.OptimismMainnet, Network.OptimismGoerli, Network.ArbitrumOne],
    },
    {
        i18label: 'markets.nav-menu.items.become-affiliate',
        iconClass: 'icon icon--affiliate',
        name: 'become-affiliate',
        route: ROUTES.Referral,
        supportedNetworks: [Network.OptimismMainnet, Network.OptimismGoerli, Network.ArbitrumOne, Network.Base],
    },
];

export const NAV_MENU_FOURTH_SECTION: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.sports-trivia',
        iconClass: 'icon icon--trivia',
        name: 'sports-trivia',
        route: ROUTES.Quiz,
        supportedNetworks: [Network.OptimismMainnet, Network.OptimismGoerli],
    },
];

export const NAV_MENU: NavMenuItem[] = [
    NAV_MENU_FIRST_SECTION,
    NAV_MENU_SECOND_SECTION,
    NAV_MENU_THIRD_SECTION,
    NAV_MENU_FOURTH_SECTION,
].flat();
