import { Network } from 'enums/network';
import { RouteComponentProps } from 'react-router-dom';
import theme from 'styles/themes/dark';
import { ShareSpeedPositionData } from './speedMarkets';
import { ShareTicketData } from './tickets';

export type ThemeInterface = typeof theme;

export type ShareModalProps = {
    data: ShareTicketData | ShareSpeedPositionData;
    onClose: () => void;
};

export type NavMenuItem = {
    i18label: string;
    iconClass: string;
    name: string;
    route: string;
    supportedNetworks: Network[];
    i18labelSmart?: string;
};

type PromotionCardData = {
    title: string;
    description: string;
    startDate: number;
    endDate: number;
    displayCountdown?: boolean;
    promotionId: string;
    promotionUrl: string;
    backgroundImageUrl: string;
    callToActionButton?: string;
    branchName?: string;
    availableOnNetworks: [Network];
};

type PromotionArticle = {
    coverImageUrl: string;
    headerHtml: string;
    ctaSection: {
        sectionHtml: string;
        ctaButtonLink: string;
        ctaButtonLabel: string;
        forceChangeNetworkOnClick?: string;
    };
    contentHtml: string;
};

export type PromotionItem = PromotionCardData & {
    article: PromotionArticle;
};

export enum PromotionStatus {
    ONGOING = 'ongoing',
    FINISHED = 'finished',
    COMING_SOON = 'coming-soon',
}

export type PromotionCardStatus = PromotionStatus;

export type OverdropLevel = {
    levelName: string;
    level: number;
    minimumPoints: number;
    smallBadge: string;
    largeBadge: string;
    loyaltyBoost: number;
    voucherAmount?: number;
};

type SEOCardData = {
    title: string;
    description: string;
    seoId: string;
    url: string;
    backgroundImageUrl: string;
    callToActionButton?: string;
    branchName?: string;
};

type SEOArticle = {
    coverImageUrl: string;
    headerHtml: string;
    ctaSection: {
        sectionHtml: string;
        ctaButtonLink: string;
        ctaButtonLabel: string;
    };
    contentHtml: string;
};

export type SEOItem = SEOCardData & {
    article: SEOArticle;
    meta: {
        title: string;
        description: string;
        keywords: string;
    };
};

export type SeoArticleProps = RouteComponentProps<{
    seoId: string;
}>;
