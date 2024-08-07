import { OVERDROP_LEVELS } from 'constants/overdrop';
import { formatCurrencyWithKey } from 'thales-utils';
import { OverdropMultiplier } from 'types/overdrop';

export const formatPoints = (amount: number) => {
    return formatCurrencyWithKey('XP', amount, undefined, true);
};

export const getMultiplierLabel = (multiplier: OverdropMultiplier) => {
    if (multiplier.name === 'dailyMultiplier') {
        return 'Days in a row';
    }
    if (multiplier.name === 'weeklyMultiplier') {
        return 'Weeks in a row';
    }
    return '';
};

export const getCurrentLevelByPoints = (points: number) => {
    const levelItem = OVERDROP_LEVELS.find(
        (item, index) => item.minimumPoints > points && OVERDROP_LEVELS[index - 1]?.minimumPoints < points
    );

    if (levelItem) return levelItem;
};

export const getNextLevelItemByPoints = (points: number) => {
    const currentLevelItemIndex = OVERDROP_LEVELS.findIndex(
        (item, index) => item.minimumPoints > points && OVERDROP_LEVELS[index - 1]?.minimumPoints < points
    );

    if (currentLevelItemIndex == -1) return OVERDROP_LEVELS[0];

    return OVERDROP_LEVELS[currentLevelItemIndex + 1];
};

export const getProgressLevel = (currentPoints: number, nextLevelPoints: number) => {
    return (currentPoints / nextLevelPoints) * 100;
};
