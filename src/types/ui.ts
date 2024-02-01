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

export type PromotionCardProps = {
    title: string;
    description: string;
    startDate: number;
    endDate: number;
    promotionUrl: string;
    backgroundImageUrl: string;
    callToActionButton?: string;
};

export type PromotionArticleProps = {
    coverImageUrl: string;
    headerHtml: string;
    ctaSection: {
        sectionHtml: string;
        ctaButtonLink: string;
        ctaButtonName: string;
    };
    contentHtml: string;
};

export type PromotionItem = PromotionCardProps & {
    article: PromotionArticleProps;
};

export type PromotionCardStatus = 'ongoing' | 'finished';
