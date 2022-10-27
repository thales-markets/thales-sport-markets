import { NavMenuItem, ThemeInterface } from 'types/ui';
import lightTheme from 'styles/themes/light';
import darkTheme from 'styles/themes/dark';
import worldCupTheme from 'styles/themes/worldcup';

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
    BACKGROUNDS: {
        RED: '#BC515E',
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
    },
    TEXT: {
        BLUE: '#64D9FE',
        WHITE: '#FFFFFF',
        POTENTIAL_PROFIT: '#5FC694',
    },
};

export const NAV_MENU: NavMenuItem[] = [
    {
        i18label: 'markets.nav-menu.items.markets',
        iconClass: 'icon icon--logo',
        name: 'markets',
    },
    {
        i18label: 'markets.nav-menu.items.profile',
        iconClass: 'icon icon--profile',
        name: 'profile',
    },
    {
        i18label: 'markets.nav-menu.items.onboarding-wizard',
        iconClass: 'icon icon--wizard',
        name: 'onboarding-wizard',
    },
    {
        i18label: 'markets.nav-menu.items.history',
        iconClass: 'icon icon--history',
        name: 'history',
    },
    {
        i18label: 'markets.nav-menu.items.sports-trivia',
        iconClass: 'icon icon--trivia',
        name: 'sports-trivia',
    },
    {
        i18label: 'markets.nav-menu.items.leaderboard',
        iconClass: 'icon icon--leaderboard',
        name: 'leaderboard',
    },
    {
        i18label: 'markets.nav-menu.items.become-affiliate',
        iconClass: 'icon icon--affiliate',
        name: 'become-affiliate',
    },
];
