import { Position } from 'constants/options';
import { NAV_MENU, ODDS_COLOR } from 'constants/ui';
import { NavMenuItem } from 'types/ui';

export const getPositionColor = (position: Position): string => {
    return position === Position.HOME
        ? ODDS_COLOR.HOME
        : position === Position.AWAY
        ? ODDS_COLOR.AWAY
        : ODDS_COLOR.DRAW;
};

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
