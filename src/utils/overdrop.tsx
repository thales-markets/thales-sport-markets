import { ONE_HUNDRED_K, ONE_MILLION } from 'constants/defaults';
import { OVERDROP_LEVELS } from 'constants/overdrop';
import { OverdropIcon } from 'pages/Overdrop/components/styled-components';
import { floorNumberToDecimals, formatCurrencyWithKey } from 'thales-utils';
import { MultiplierType, OverdropMultiplier } from 'types/overdrop';
import { OverdropLevel } from 'types/ui';

export const formatPoints = (amount: number) => {
    if (amount > 9 * ONE_HUNDRED_K) {
        return `${floorNumberToDecimals(amount / ONE_MILLION)}M XP`;
    }
    return formatCurrencyWithKey('XP', amount, undefined, true);
};

export const getMultiplierLabel = (multiplier: OverdropMultiplier) => {
    if (multiplier.name === 'dailyMultiplier') {
        return 'Days in a row';
    }
    if (multiplier.name === 'weeklyMultiplier') {
        return 'Weeks in a row';
    }
    if (multiplier.name === 'twitterMultiplier') {
        return 'Twitter share';
    }
    if (multiplier.name === 'loyaltyMultiplier') {
        return 'Loyalty';
    }
    return '';
};

export const getTooltipKey = (multiplier: OverdropMultiplier) => {
    if (multiplier.name === 'dailyMultiplier') {
        return 'daily-boost';
    }
    if (multiplier.name === 'weeklyMultiplier') {
        return 'weekly-boost';
    }
    if (multiplier.name === 'twitterMultiplier') {
        return 'twitter-boost';
    }
    if (multiplier.name === 'loyaltyMultiplier') {
        return 'loyalty-boost';
    }
    return '';
};

export const getMultiplierIcon = (multiplier: OverdropMultiplier) => {
    if (multiplier.name === 'dailyMultiplier' || multiplier.name === 'weeklyMultiplier') {
        return <>{multiplier.multiplier === 0 ? 0 : multiplier.multiplier / 10 + 1}</>;
    }

    if (multiplier.name === 'twitterMultiplier') {
        return <OverdropIcon className="icon icon--x-twitter" />;
    }
    return <></>;
};

export const getParlayMultiplier = (numberOfMarkets: number) => {
    let parlayMultiplier = 0;
    for (let index = 1; index < numberOfMarkets; index++) {
        if (index < 5) {
            parlayMultiplier = parlayMultiplier + 10;
        } else if (index >= 5 && index < 10) {
            parlayMultiplier = parlayMultiplier + 20;
        } else {
            parlayMultiplier = parlayMultiplier + 30;
        }
    }
    return parlayMultiplier;
};

export const getCurrentLevelByPoints = (points: number) => {
    const levelItemIndex = OVERDROP_LEVELS.findIndex((item, index) => {
        if (item.minimumPoints > points && OVERDROP_LEVELS[index - 1].minimumPoints < points) return item;
    });

    if (levelItemIndex !== -1) return OVERDROP_LEVELS[levelItemIndex - 1];
    if (OVERDROP_LEVELS[0].minimumPoints < points) return OVERDROP_LEVELS[0];
    return OVERDROP_LEVELS[0];
};

export const getNextLevelItemByPoints = (points?: number) => {
    if (!points) return OVERDROP_LEVELS[0];
    const currentLevelItemIndex = OVERDROP_LEVELS.findIndex((item, index) => {
        if (item.minimumPoints > points && OVERDROP_LEVELS[index - 1].minimumPoints < points) return item;
    });

    if (currentLevelItemIndex == -1) return OVERDROP_LEVELS[0];

    return OVERDROP_LEVELS[currentLevelItemIndex];
};

export const getProgressLevel = (
    currentPoints: number,
    currentLevelMinimumPoints: number,
    nextLevelMinimumPoints: number
) => {
    return ((currentPoints - currentLevelMinimumPoints) / (nextLevelMinimumPoints - currentLevelMinimumPoints)) * 100;
};

export const getMultiplierValueFromQuery = (data: OverdropMultiplier[] | undefined, multiplierType: MultiplierType) => {
    const multiplierItem = data?.find((item) => item.name == multiplierType);
    return multiplierItem?.multiplier ? multiplierItem.multiplier : 0;
};

export const getNextThalesRewardLevel = (points?: number) => {
    const levelItemsWithVoucher = OVERDROP_LEVELS.filter((item) => item.voucherAmount);

    if (!points) return levelItemsWithVoucher[0] as OverdropLevel;

    if (levelItemsWithVoucher[levelItemsWithVoucher.length - 1].minimumPoints < points) return;

    const levelItemIndex = levelItemsWithVoucher.findIndex((item, index) => {
        if (item?.minimumPoints > points && !OVERDROP_LEVELS[index - 1]) return item;
        if (item?.minimumPoints > points && OVERDROP_LEVELS[index - 1]?.minimumPoints < points) return item;
    });

    if (levelItemIndex == -1) return levelItemsWithVoucher[0];

    return levelItemsWithVoucher[levelItemIndex] ? levelItemsWithVoucher[levelItemIndex] : undefined;
};
