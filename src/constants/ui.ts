import { NavMenuItem, ThemeInterface } from 'types/ui';
import lightTheme from 'styles/themes/light';
import darkTheme from 'styles/themes/dark';
import worldCupTheme from 'styles/themes/worldcup';
import ROUTES from './routes';

export enum Theme {
    LIGHT,
    DARK,
    WORLDCUP,
}

export const ThemeMap: Record<Theme, ThemeInterface> = {
    [Theme.LIGHT]: lightTheme,
    [Theme.DARK]: darkTheme,
    [Theme.WORLDCUP]: worldCupTheme,
};

export const ODDS_COLOR = {
    HOME: '#5FC694',
    AWAY: '#E26A78',
    DRAW: '#FAC438',
    YES: '#5FC694',
    NO: '#E26A78',
};

export const STATUS_COLOR = {
    CLAIMABLE: '#3FD1FF',
    STARTED: '#E26A78',
    FINISHED: '#FFFFFF',
    CANCELED: '#E26A78',
    COMING_SOON: '#FAC439',
    PAUSED: '#E26A78',
};

export const MAIN_COLORS = {
    LIGHT_GRAY: '#303656',
    DARK_GRAY: '#1A1C2B',
    DISABLED_GRAY: '#303656',
    LIGHT_BLUE: 'rgba(63,209,255,1)',
    DIVIDER_COLOR: '#5F6180',
    BACKGROUNDS: {
        RED: '#BC515E',
        BLUE: '#3FD1FF',
    },
    BORDERS: {
        GRAY: '#5f6180',
        WINNER: '#3FD1FF',
    },
    SHADOWS: {
        WINNER: '0px 0px 33px -7px rgba(63,209,255,1)',
        DRAW: '0px 0px 33px -7px rgba(63,209,255,1)',
        POSITION_HOVER: '0px 0px 39px -16px rgba(64,210,255,1)',
        NAV_BAR: '-64px 0px 38px 3px rgba(0,0,0,0.41)',
        NOTIFICATION: '0px 0px 20px rgba(63, 177, 213, 0.96)',
    },
    TEXT: {
        BLUE: '#64D9FE',
        WHITE: '#FFFFFF',
        POTENTIAL_PROFIT: '#5FC694',
        DARK_GRAY: '#5F6180',
        CANCELED: '#E26A78',
    },
};

export const NAV_MENU: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.markets',
        iconClass: 'icon icon--logo',
        name: 'markets',
        route: ROUTES.Markets.Home,
    },
    {
        i18label: 'markets.nav-menu.items.vaults',
        iconClass: 'icon icon--vaults',
        name: 'vaults',
        route: ROUTES.Vaults,
    },
    {
        i18label: 'markets.nav-menu.items.profile',
        iconClass: 'icon icon--profile',
        name: 'profile',
        route: ROUTES.Profile,
    },
    {
        i18label: 'markets.nav-menu.items.leaderboard',
        iconClass: 'icon icon--competition',
        name: 'parlay-competition',
        route: ROUTES.Leaderboard,
    },

    {
        i18label: 'markets.nav-menu.items.fee-rebates',
        iconClass: 'icon icon--fee-rebates',
        name: 'fee-rebates',
        route: ROUTES.Rewards,
    },
    {
        i18label: 'markets.nav-menu.items.become-affiliate',
        iconClass: 'icon icon--affiliate',
        name: 'become-affiliate',
        route: ROUTES.Referral,
    },
    {
        i18label: 'markets.nav-menu.items.sports-trivia',
        iconClass: 'icon icon--trivia',
        name: 'sports-trivia',
        route: ROUTES.Quiz,
    },
    // {
    //     i18label: 'markets.nav-menu.items.onboarding-wizard',
    //     iconClass: 'icon icon--wizard',
    //     name: 'onboarding-wizard',
    //     route: ROUTES.Markets.Home,
    // },
];
