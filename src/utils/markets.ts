import {
    AWAY_TEAM_MARKET_TYPES,
    BOTH_TEAMS_TO_SCORE_MARKET_TYPES,
    CARDS_MARKET_TYPES,
    COMBINED_POSITIONS_MARKET_TYPES,
    CORNERS_MARKET_TYPES,
    DOUBLE_CHANCE_MARKET_TYPES,
    EIGHTH_PERIOD_MARKET_TYPES,
    FIFTH_PERIOD_MARKET_TYPES,
    FIRST_PERIOD_MARKET_TYPES,
    FIRST_PERIOD_MARKET_TYPES2,
    FIRST_SEVEN_INNINGS_MARKET_TYPES,
    FIRST_THREE_INNINGS_MARKET_TYPES,
    FOURTH_PERIOD_MARKET_TYPES,
    FUTURES_MARKET_TYPES,
    HOME_TEAM_MARKET_TYPES,
    NINTH_PERIOD_MARKET_TYPES,
    ONE_SIDE_PLAYER_PROPS_MARKET_TYPES,
    OTHER_YES_NO_MARKET_TYPES,
    PERIOD_MARKET_TYPES,
    PLAYER_PROPS_MARKET_TYPES,
    SCORE_MARKET_TYPES,
    SECOND_PERIOD_MARKET_TYPES,
    SECOND_PERIOD_MARKET_TYPES2,
    SEVENTH_PERIOD_MARKET_TYPES,
    SIXTH_PERIOD_MARKET_TYPES,
    SPREAD_MARKET_TYPES,
    THIRD_PERIOD_MARKET_TYPES,
    TOTAL_EXACT_MARKET_TYPES,
    TOTAL_MARKET_TYPES,
    TOTAL_ODD_EVEN_MARKET_TYPES,
    UFC_SPECIFIC_MARKET_TYPES,
    WINNER_MARKET_TYPES,
    YES_NO_PLAYER_PROPS_MARKET_TYPES,
} from 'constants/marketTypes';
import { MarketType } from 'enums/marketTypes';
import { OddsType } from 'enums/markets';
import { formatCurrency } from 'thales-utils';
import { MarketTypeMap } from '../constants/marketTypes';
import { League, Sport } from '../enums/sports';
import { getLeagueIsDrawAvailable, getLeagueSport } from './sports';

export const formatMarketOdds = (oddsType: OddsType, odds: number | undefined) => {
    if (!odds) {
        return '0';
    }
    switch (oddsType) {
        case OddsType.DECIMAL:
            return `${formatCurrency(1 / odds, 2)}`;
        case OddsType.AMERICAN:
            const decimal = 1 / odds;
            if (decimal >= 2) {
                return `+${formatCurrency((decimal - 1) * 100, 0)}`;
            } else {
                return `-${formatCurrency(100 / (decimal - 1), 0)}`;
            }
        case OddsType.AMM:
        default:
            return `${formatCurrency(odds, odds < 0.001 ? 8 : odds < 0.1 ? 4 : 2)}`;
    }
};

export const isOneSideMarket = (league: number, marketType: MarketType) =>
    getLeagueSport(league) === Sport.MOTOSPORT ||
    league == League.GOLF_WINNER ||
    league == League.US_ELECTION ||
    marketType === MarketType.TO_MAKE_FINAL_FOUR;

export const isPlayerPropsMarket = (marketType: MarketType) => {
    return PLAYER_PROPS_MARKET_TYPES.includes(marketType);
};

export const isOnlyOverPlayerPropsMarket = (marketType: MarketType, odds: number[]) => {
    return isPlayerPropsMarket(marketType) && odds.length === 1;
};

export const isOneSidePlayerPropsMarket = (marketType: MarketType) => {
    return ONE_SIDE_PLAYER_PROPS_MARKET_TYPES.includes(marketType);
};

export const isYesNoPlayerPropsMarket = (marketType: MarketType) => {
    return YES_NO_PLAYER_PROPS_MARKET_TYPES.includes(marketType);
};

export const isWinnerMarket = (marketType: MarketType) => {
    return WINNER_MARKET_TYPES.includes(marketType);
};

const isDrawAvailableMarket = (marketType: MarketType) => {
    return WINNER_MARKET_TYPES.includes(marketType) || SCORE_MARKET_TYPES.includes(marketType);
};

export const isTotalMarket = (marketType: MarketType) => {
    return TOTAL_MARKET_TYPES.includes(marketType);
};

export const isTotalOddEvenMarket = (marketType: MarketType) => {
    return TOTAL_ODD_EVEN_MARKET_TYPES.includes(marketType);
};

export const isSpreadMarket = (marketType: MarketType) => {
    return SPREAD_MARKET_TYPES.includes(marketType);
};

export const isCombinedPositionsMarket = (marketType: MarketType) => {
    return COMBINED_POSITIONS_MARKET_TYPES.includes(marketType);
};

export const isBothsTeamsToScoreMarket = (marketType: MarketType) => {
    return BOTH_TEAMS_TO_SCORE_MARKET_TYPES.includes(marketType);
};

export const isDoubleChanceMarket = (marketType: MarketType) => {
    return DOUBLE_CHANCE_MARKET_TYPES.includes(marketType);
};

export const isPeriodMarket = (marketType: MarketType) => {
    return PERIOD_MARKET_TYPES.includes(marketType);
};

export const isPeriod2Market = (marketType: MarketType) => {
    return (
        (marketType >= MarketType.FIRST_PERIOD_WINNER2 && marketType <= MarketType.NINTH_PERIOD_WINNER2) ||
        (marketType >= MarketType.FIRST_PERIOD_TOTAL2 && marketType <= MarketType.NINTH_PERIOD_TOTAL2) ||
        (marketType >= MarketType.FIRST_PERIOD_SPREAD2 && marketType <= MarketType.NINTH_PERIOD_SPREAD2) ||
        (marketType >= MarketType.FIRST_PERIOD_TOTAL2_ODD_EVEN &&
            marketType <= MarketType.NINTH_PERIOD_TOTAL2_ODD_EVEN) ||
        (marketType >= MarketType.FIRST_PERIOD_TOTAL2_HOME_TEAM &&
            marketType <= MarketType.FIRST_PERIOD_TOTAL2_AWAY_TEAM) ||
        (marketType >= MarketType.SECOND_PERIOD_TOTAL2_HOME_TEAM &&
            marketType <= MarketType.SECOND_PERIOD_TOTAL2_AWAY_TEAM)
    );
};

export const isHomeTeamMarket = (marketType: MarketType) => {
    return HOME_TEAM_MARKET_TYPES.includes(marketType);
};

export const isAwayTeamMarket = (marketType: MarketType) => {
    return AWAY_TEAM_MARKET_TYPES.includes(marketType);
};

export const isScoreMarket = (marketType: MarketType) => {
    return SCORE_MARKET_TYPES.includes(marketType);
};

export const isOtherYesNoMarket = (marketType: MarketType) => {
    return OTHER_YES_NO_MARKET_TYPES.includes(marketType);
};

export const isUfcSpecificMarket = (marketType: MarketType) => {
    return UFC_SPECIFIC_MARKET_TYPES.includes(marketType);
};

export const isTotalExactMarket = (marketType: MarketType) => {
    return TOTAL_EXACT_MARKET_TYPES.includes(marketType);
};

const getIsDrawAvailable = (leagueId: number, marketType: MarketType) =>
    getLeagueIsDrawAvailable(leagueId) && isDrawAvailableMarket(marketType);

export const getPositionOrder = (leagueId: number, marketType: MarketType, position: number) =>
    getIsDrawAvailable(leagueId, marketType) ? `${position == 0 ? 1 : position == 1 ? 3 : 2}` : undefined;

export const getMarketTypeName = (marketType: MarketType, shortName?: boolean) => {
    const marketTypeInfo = MarketTypeMap[marketType];
    return marketTypeInfo
        ? shortName
            ? marketTypeInfo.shortName || marketTypeInfo.name
            : marketTypeInfo.name
        : marketType;
};

export const getMarketTypeDescription = (marketType: MarketType) => {
    const marketTypeInfo = MarketTypeMap[marketType];
    return marketTypeInfo ? marketTypeInfo.description : undefined;
};

export const getMarketTypeTooltipKey = (marketType: MarketType) => {
    const marketTypeInfo = MarketTypeMap[marketType];
    return marketTypeInfo ? marketTypeInfo.tooltipKey : undefined;
};

export const isWithinSlippage = (originalOdd: number, newOdd: number, slippage: number): boolean => {
    if (originalOdd === newOdd) {
        return true;
    }
    const allowedChange = (originalOdd * slippage) / 100;
    return newOdd < originalOdd ? newOdd >= originalOdd - allowedChange : newOdd <= originalOdd + allowedChange;
};

export const isFuturesMarket = (marketType: MarketType) => {
    return FUTURES_MARKET_TYPES.includes(marketType);
};

export const isContractResultView = (marketType: MarketType) => {
    return CORNERS_MARKET_TYPES.includes(marketType) || CARDS_MARKET_TYPES.includes(marketType);
};

export const getPeriodsForResultView = (marketType: MarketType, leagueId: League) => {
    if (FIRST_PERIOD_MARKET_TYPES.includes(marketType)) {
        return [1];
    }
    if (SECOND_PERIOD_MARKET_TYPES.includes(marketType)) {
        return [2];
    }
    if (THIRD_PERIOD_MARKET_TYPES.includes(marketType)) {
        return [3];
    }
    if (FOURTH_PERIOD_MARKET_TYPES.includes(marketType)) {
        return [4];
    }
    if (FIFTH_PERIOD_MARKET_TYPES.includes(marketType)) {
        return [5];
    }
    if (SIXTH_PERIOD_MARKET_TYPES.includes(marketType)) {
        return [6];
    }
    if (SEVENTH_PERIOD_MARKET_TYPES.includes(marketType)) {
        return [7];
    }
    if (EIGHTH_PERIOD_MARKET_TYPES.includes(marketType)) {
        return [8];
    }
    if (NINTH_PERIOD_MARKET_TYPES.includes(marketType)) {
        return [9];
    }
    if (FIRST_THREE_INNINGS_MARKET_TYPES.includes(marketType)) {
        return [1, 2, 3];
    }
    if (FIRST_SEVEN_INNINGS_MARKET_TYPES.includes(marketType)) {
        return [1, 2, 3, 4, 5, 6, 7];
    }
    if (FIRST_PERIOD_MARKET_TYPES2.includes(marketType)) {
        const sport = getLeagueSport(leagueId);
        if (sport === Sport.BASEBALL) {
            return [1, 2, 3, 4, 5];
        } else {
            return [1, 2];
        }
    }
    if (SECOND_PERIOD_MARKET_TYPES2.includes(marketType)) {
        return [3, 4];
    }
    return [];
};
