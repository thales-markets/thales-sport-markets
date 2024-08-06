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
