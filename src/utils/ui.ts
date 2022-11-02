import { Position } from 'constants/options';
import { ODDS_COLOR } from 'constants/ui';

export const getPositionColor = (position: Position): string => {
    return position === Position.HOME
        ? ODDS_COLOR.HOME
        : position === Position.AWAY
        ? ODDS_COLOR.AWAY
        : ODDS_COLOR.DRAW;
};
