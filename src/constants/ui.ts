import { ThemeInterface } from 'types/ui';
import lightTheme from 'styles/themes/light';
import darkTheme from 'styles/themes/dark';

export enum Theme {
    LIGHT,
    DARK,
}

export const ThemeMap: Record<Theme, ThemeInterface> = {
    [Theme.LIGHT]: lightTheme,
    [Theme.DARK]: darkTheme,
};

export const ODDS_COLOR = {
    HOME: '#5FC694',
    AWAY: '#E26A78',
    DRAW: '#FAC438',
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
    BORDERS: {
        GRAY: '#5f6180',
        WINNER: '#3FD1FF',
    },
    SHADOWS: {
        WINNER: '0px 0px 33px -7px rgba(63,209,255,1)',
        DRAW: '0px 0px 33px -7px rgba(63,209,255,1)',
    },
};
