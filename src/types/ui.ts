import theme from 'styles/themes/dark';
import { NetworkId } from './network';

export type ThemeInterface = typeof theme;

export type NavMenuItem = {
    i18label: string;
    iconClass: string;
    name: string;
    route: string;
    supportedNetworks: NetworkId[];
};
