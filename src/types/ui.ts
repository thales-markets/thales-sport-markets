import theme from 'styles/themes/dark';

export type ThemeInterface = typeof theme;

export type NavMenuItem = {
    i18label: string;
    iconClass: string;
    name: string;
    route: string;
};
