import { COUNTRY_BASED_TOURNAMENTS } from 'constants/markets';
import { OddsType } from 'enums/markets';
import {
    getLeagueIsDrawAvailable,
    getLeagueSport,
    isDrawAvailableMarket,
    League,
    MarketType,
    MarketTypeMap,
    Sport,
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
                return decimal === 1 ? '-' : `-${formatCurrency(100 / (decimal - 1), 0)}`;
            }
        case OddsType.AMM:
        default:
            return `${formatCurrency(odds, odds < 0.001 ? 8 : odds < 0.1 ? 4 : 2)}`;
    }
};

const getIsDrawAvailable = (leagueId: number, marketType: MarketType) =>
    (getLeagueIsDrawAvailable(leagueId) ||
        getLeagueSport(leagueId) === Sport.BASEBALL ||
        getLeagueSport(leagueId) === Sport.CRICKET ||
        getLeagueSport(leagueId) === Sport.HOCKEY) &&
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

export const isOddsChangeAllowed = (originalOdd: number, newOdd: number, slippage: number): boolean => {
    if (originalOdd >= newOdd) {
        // new quote is better
        return true;
    }
    const allowedChange = (originalOdd * slippage) / 100;
    return newOdd <= originalOdd + allowedChange;
};

export const getCountryFromTournament = (tournament: string, leagueId: League): string => {
    const leagueSport = getLeagueSport(leagueId);
    const tournamentNameSplit = tournament.split(',');

    const countryIndex =
        tournamentNameSplit.length > 0 &&
        tournamentNameSplit[tournamentNameSplit.length - 1].trim().toLowerCase() === 'qualifying'
            ? tournamentNameSplit.length - 2
            : tournamentNameSplit.length - 1;

    const country =
        countryIndex >= 0 && COUNTRY_BASED_TOURNAMENTS.includes(leagueSport)
            ? tournamentNameSplit[countryIndex].trim()
            : '';
    return country;
};
