import { formatCurrencyWithKey } from 'thales-utils';

export const formatPoints = (amount: number) => {
    return formatCurrencyWithKey('XP', amount, undefined, true);
};
