import { Network } from 'enums/network';
import theme from 'styles/themes/dark';

export type ThemeInterface = typeof theme;

export type Page = 'Home' | 'Markets' | 'Vaults' | 'ParlayLeaderboard' | 'Referral' | 'Profile' | 'LiquidityPool';

export type NavMenuItem = {
    i18label: string;
    iconClass: string;
    name: string;
    route: string;
    supportedNetworks: Network[];
};
