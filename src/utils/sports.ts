import { League, PeriodType, Sport } from 'enums/sports';
import { LeagueMap } from '../constants/sports';

export const getLeagueSport = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.sport : '';
};

export const getLeagueScoringType = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.scoringType : PeriodType.EMPTY;
};

export const getLeagueMatchResolveType = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.matchResolveType : PeriodType.EMPTY;
};

export const getLeaguePeriodType = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.periodType : PeriodType.EMPTY;
};

export const getLeagueProvider = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.provider : '';
};

export const getLeagueIsDrawAvailable = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.isDrawAvailable : false;
};

export const getSportLeagueIds = (sport: Sport) => {
    const allLeagues = Object.values(LeagueMap);
    return allLeagues.filter((league) => league.sport === sport).map((league) => league.id);
};

export const getLiveSupportedLeagues = () => {
    const allLeagues = Object.values(LeagueMap);
    return allLeagues.filter((league) => league.live).map((league) => league.id);
};

export const isLiveSupportedForLeague = (league: League) => {
    const leagueInfo = LeagueMap[league];
    return leagueInfo ? leagueInfo.live : false;
};
