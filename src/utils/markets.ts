import { OddsType } from 'enums/markets';
import {
    EIGHTH_PERIOD_MARKET_TYPES,
    FIFTH_PERIOD_MARKET_TYPES,
    FIRST_PERIOD_MARKET_TYPES,
    FIRST_PERIOD_MARKET_TYPES2,
    FIRST_SEVEN_INNINGS_MARKET_TYPES,
    FIRST_THREE_INNINGS_MARKET_TYPES,
    FOURTH_PERIOD_MARKET_TYPES,
    getLeagueIsDrawAvailable,
    getLeagueSport,
    isDrawAvailableMarket,
    League,
    MarketType,
    MarketTypeMap,
    NINTH_PERIOD_MARKET_TYPES,
    SECOND_PERIOD_MARKET_TYPES,
    SECOND_PERIOD_MARKET_TYPES2,
    SEVENTH_PERIOD_MARKET_TYPES,
    SIXTH_PERIOD_MARKET_TYPES,
    Sport,
    THIRD_PERIOD_MARKET_TYPES,
} from 'overtime-utils';
import { formatCurrency } from 'thales-utils';

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

const getIsDrawAvailable = (leagueId: number, marketType: MarketType) =>
    (getLeagueIsDrawAvailable(leagueId) ||
        getLeagueSport(leagueId) === Sport.BASEBALL ||
        getLeagueSport(leagueId) === Sport.CRICKET) &&
    isDrawAvailableMarket(marketType);

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
