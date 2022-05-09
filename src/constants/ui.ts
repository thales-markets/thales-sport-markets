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
