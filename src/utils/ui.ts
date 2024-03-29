import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { NAV_MENU } from 'constants/ui';
import { localStore } from 'thales-utils';
import { NavMenuItem, PromotionCardStatus, PromotionStatus } from 'types/ui';
import { formatTimestampForPromotionDate } from './formatters/date';

export const getOrdinalNumberLabel = (num: number): string => {
    switch (num) {
        case 1:
            return '1st';
        case 2:
            return '2nd';
        case 3:
            return '3rd';
        default:
            return num + 'th';
    }
};

export const getNavItemFromRoute = (route: string): NavMenuItem | null => {
    const navItem = NAV_MENU.find((item) => item.route == route);
    if (navItem) return navItem;
    return null;
};

export const getPromotionStatus = (startDate: number, endDate: number): PromotionCardStatus => {
    if (
        (endDate > Date.now() / 1000 && Date.now() / 1000 > startDate) ||
        (endDate == 0 && Date.now() / 1000 > startDate)
    )
        return PromotionStatus.ONGOING;
    if (Date.now() / 1000 < startDate) return PromotionStatus.COMING_SOON;
    return PromotionStatus.FINISHED;
};

export const getPromotionDateRange = (startDate: number, endDate: number): string => {
    if (startDate && endDate == 0) {
        return `${formatTimestampForPromotionDate(startDate)} - ${String.fromCharCode(0x0221e)}`;
    }
    return `${formatTimestampForPromotionDate(startDate)} - ${formatTimestampForPromotionDate(endDate)}`;
};

export const getKeepSelectionFromStorage = (): boolean => {
    return localStore.get(LOCAL_STORAGE_KEYS.KEEP_SELECTION)
        ? (localStore.get(LOCAL_STORAGE_KEYS.KEEP_SELECTION) as boolean)
        : false;
};

export const setKeepSelectionToStorage = (value: boolean) => {
    localStore.set(LOCAL_STORAGE_KEYS.KEEP_SELECTION, value);
};
