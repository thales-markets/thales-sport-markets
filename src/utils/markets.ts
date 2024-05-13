import {
    FIFA_WC_TAG,
    FIFA_WC_U20_TAG,
    GOLF_TAGS,
    GOLF_TOURNAMENT_WINNER_TAG,
    IIHF_WC_TAG,
    INTERNATIONAL_SPORTS,
    MOTOSPORT_TAGS,
    SPORTS_TAGS_MAP,
    TAGS_OF_MARKETS_WITHOUT_DRAW_ODDS,
    UEFA_TAGS,
} from 'constants/tags';
import {
    BOTH_TEAMS_TO_SCORE_BET_TYPES,
    BetType,
    COMBINED_POSITIONS_BET_TYPES,
    DOUBLE_CHANCE_BET_TYPES,
    ONE_SIDER_PLAYER_PROPS_BET_TYPES,
    OddsType,
    PLAYER_PROPS_BET_TYPES,
    SPECIAL_YES_NO_BET_TYPES,
    SPREAD_BET_TYPES,
    TOTAL_BET_TYPES,
    TOTAL_ODD_EVEN_BET_TYPES,
    WINNER_BET_TYPES,
} from 'enums/markets';
import { formatCurrency } from 'thales-utils';

export const formatMarketOdds = (oddsType: OddsType, odds: number | undefined) => {
    if (!odds) {
        return '0';
    }
    switch (oddsType) {
        case OddsType.Decimal:
            return `${formatCurrency(1 / odds, 2)}`;
        case OddsType.American:
            const decimal = 1 / odds;
            if (decimal >= 2) {
                return `+${formatCurrency((decimal - 1) * 100, 0)}`;
            } else {
                return `-${formatCurrency(100 / (decimal - 1), 0)}`;
            }
        case OddsType.AMM:
        default:
            return `${formatCurrency(odds, odds < 0.1 ? 4 : 2)}`;
    }
};

export const isFifaWCGame = (tag: number) => Number(tag) === FIFA_WC_TAG || Number(tag) === FIFA_WC_U20_TAG;

export const isIIHFWCGame = (tag: number) => Number(tag) === IIHF_WC_TAG;

export const isUEFAGame = (tag: number) => UEFA_TAGS.includes(tag);

export const isInternationalGame = (tag: number) => INTERNATIONAL_SPORTS.includes(tag);

export const isMotosport = (tag: number) => MOTOSPORT_TAGS.includes(tag);

export const isGolf = (tag: number) => GOLF_TAGS.includes(tag);

export const getIsOneSideMarket = (tag: number) =>
    SPORTS_TAGS_MAP['Motosport'].includes(Number(tag)) || Number(tag) == GOLF_TOURNAMENT_WINNER_TAG;

export const isPlayerProps = (betType: BetType) => {
    return PLAYER_PROPS_BET_TYPES.includes(betType);
};

export const isOneSidePlayerProps = (betType: BetType) => {
    return ONE_SIDER_PLAYER_PROPS_BET_TYPES.includes(betType);
};

export const isSpecialYesNoProp = (betType: BetType) => {
    return SPECIAL_YES_NO_BET_TYPES.includes(betType);
};

export const isWinner = (betType: BetType) => {
    return WINNER_BET_TYPES.includes(betType) || `${betType}`.startsWith('1002') || `${betType}`.startsWith('1005');
};

export const isTotal = (betType: BetType) => {
    return (
        TOTAL_BET_TYPES.includes(betType) ||
        `${betType}`.startsWith('1003') ||
        `${betType}`.startsWith('1006') ||
        `${betType}`.startsWith('1011') ||
        `${betType}`.startsWith('1012')
    );
};

export const isTotalOddEven = (betType: BetType) => {
    return (
        TOTAL_ODD_EVEN_BET_TYPES.includes(betType) || `${betType}`.startsWith('1008') || `${betType}`.startsWith('1009')
    );
};

export const isSpread = (betType: BetType) => {
    return SPREAD_BET_TYPES.includes(betType) || `${betType}`.startsWith('1004') || `${betType}`.startsWith('1007');
};

export const isCombinedPositions = (betType: BetType) => {
    return COMBINED_POSITIONS_BET_TYPES.includes(betType);
};

export const isPeriod = (betType: BetType) => {
    return (
        `${betType}`.startsWith('1002') ||
        `${betType}`.startsWith('1003') ||
        `${betType}`.startsWith('1004') ||
        `${betType}`.startsWith('1008') ||
        `${betType}`.startsWith('1010') ||
        `${betType}`.startsWith('1011') ||
        `${betType}`.startsWith('1012') ||
        betType === BetType.FIRST_PERIOD_DOUBLE_CHANCE ||
        betType === BetType.SECOND_PERIOD_DOUBLE_CHANCE
    );
};

export const isPeriod2 = (betType: BetType) => {
    return (
        `${betType}`.startsWith('1005') ||
        `${betType}`.startsWith('1006') ||
        `${betType}`.startsWith('1007') ||
        `${betType}`.startsWith('1009')
    );
};

export const isBothsTeamsToScore = (betType: BetType) => {
    return BOTH_TEAMS_TO_SCORE_BET_TYPES.includes(betType) || `${betType}`.startsWith('1010');
};

export const getIsDrawAvailable = (leagueId: number, betType: BetType) =>
    !TAGS_OF_MARKETS_WITHOUT_DRAW_ODDS.includes(leagueId) && isWinner(betType);

export const getPositionOrder = (leagueId: number, betType: BetType, position: number) =>
    getIsDrawAvailable(leagueId, betType) ? `${position == 0 ? 1 : position == 1 ? 3 : 2}` : undefined;

export const isDoubleChance = (betType: BetType) => {
    return DOUBLE_CHANCE_BET_TYPES.includes(betType);
};
