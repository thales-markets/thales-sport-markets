import {
    AWAY_TEAM_MARKET_TYPES,
    BOTH_TEAMS_TO_SCORE_MARKET_TYPES,
    COMBINED_POSITIONS_MARKET_TYPES,
    DOUBLE_CHANCE_MARKET_TYPES,
    HOME_TEAM_MARKET_TYPES,
    ONE_SIDE_PLAYER_PROPS_MARKET_TYPES,
    PLAYER_PROPS_MARKET_TYPES,
    SPREAD_MARKET_TYPES,
    TOTAL_MARKET_TYPES,
    TOTAL_ODD_EVEN_MARKET_TYPES,
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
            return `${formatCurrency(odds, odds < 0.1 ? 4 : 2)}`;
    }
};

export const isOneSideMarket = (league: number) =>
    getLeagueSport(league) === Sport.MOTOSPORT || league == League.GOLF_WINNER;

export const isPlayerPropsMarket = (marketType: MarketType) => {
    return PLAYER_PROPS_MARKET_TYPES.includes(marketType);
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
    return (
        marketType === MarketType.FIRST_PERIOD_DOUBLE_CHANCE ||
        marketType === MarketType.SECOND_PERIOD_DOUBLE_CHANCE ||
        `${marketType}`.startsWith('1002') ||
        `${marketType}`.startsWith('1003') ||
        `${marketType}`.startsWith('1004') ||
        `${marketType}`.startsWith('1008') ||
        `${marketType}`.startsWith('1010') ||
        `${marketType}`.startsWith('1011') ||
        `${marketType}`.startsWith('1021')
    );
};

export const isPeriod2Market = (marketType: MarketType) => {
    return (
        `${marketType}`.startsWith('1005') ||
        `${marketType}`.startsWith('1006') ||
        `${marketType}`.startsWith('1007') ||
        `${marketType}`.startsWith('1009')
    );
};

export const isHomeTeamMarket = (marketType: MarketType) => {
    return HOME_TEAM_MARKET_TYPES.includes(marketType);
};

export const isAwayTeamMarket = (marketType: MarketType) => {
    return AWAY_TEAM_MARKET_TYPES.includes(marketType);
};

export const getIsDrawAvailable = (leagueId: number, marketType: MarketType) =>
    getLeagueIsDrawAvailable(leagueId) && isWinnerMarket(marketType);

export const getPositionOrder = (leagueId: number, marketType: MarketType, position: number) =>
    getIsDrawAvailable(leagueId, marketType) ? `${position == 0 ? 1 : position == 1 ? 3 : 2}` : undefined;

export const getMarketTypeName = (marketType: MarketType) => {
    const marketTypeInfo = MarketTypeMap[marketType];
    return marketTypeInfo ? marketTypeInfo.name : marketType;
};

export const isWithinSlippage = (originalOdd: number, newOdd: number, slippage: number): boolean => {
    // TODO: remove
    return true;
    if (originalOdd === newOdd) {
        return true;
    }
    const allowedChange = (originalOdd * slippage) / 100;
    return newOdd < originalOdd ? newOdd >= originalOdd - allowedChange : newOdd <= originalOdd + allowedChange;
};
