import { League, MatchResolveType, PeriodType, ScoringType, Sport } from 'enums/sports';
import {
    BOXING_LEAGUES,
    INTERNATIONAL_LEAGUES,
    LeagueMap,
    OLYMPIC_LEAGUES,
    PLAYER_PROPS_COMBINING_ENABLED_LEAGUES,
} from '../constants/sports';

export const getLeagueSport = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.sport : Sport.EMPTY;
};

export const getLeagueLabel = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.label : '';
};

export const getLeagueScoringType = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.scoringType : ScoringType.EMPTY;
};

export const getLeagueMatchResolveType = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.matchResolveType : MatchResolveType.EMPTY;
};

export const getLeaguePeriodType = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.periodType : PeriodType.EMPTY;
};

export const getLeagueIsDrawAvailable = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.isDrawAvailable : false;
};

export const getSportLeagueIds = (sport: Sport) => {
    const allLeagues = Object.values(LeagueMap);
    return allLeagues.filter((league) => league.sport === sport).map((league) => league.id);
};

export const getLeagueTooltipKey = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.tooltipKey : undefined;
};

export const isBoxingLeague = (league: League) => {
    return BOXING_LEAGUES.includes(league);
};

export const isInternationalLeague = (league: League) => INTERNATIONAL_LEAGUES.includes(league);

export const isOlympicLeague = (league: League) => OLYMPIC_LEAGUES.includes(league);

export const isPlayerPropsCombiningEnabled = (league: League) => {
    return PLAYER_PROPS_COMBINING_ENABLED_LEAGUES.includes(league);
};
