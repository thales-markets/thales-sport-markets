import { Network } from 'enums/network';
import theme from 'styles/themes/dark';

export type ThemeInterface = typeof theme;

export type NavMenuItem = {
    i18label: string;
    iconClass: string;
    name: string;
    route: string;
    supportedNetworks: Network[];
};

type PromptEventResponse = {
    outcome: 'dismissed' | 'accepted';
    platform: string;
};

export type BeforeInstallEvent = Event & {
    prompt: () => Promise<PromptEventResponse>;
};
