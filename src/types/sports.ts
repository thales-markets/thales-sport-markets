import { League, MatchResolveType, PeriodType, ScoringType, Sport } from 'enums/sports';

export type LeagueInfo = {
    sport: Sport;
    id: League;
    label: string;
    logo?: string;
    logoClass?: string;
    scoringType: ScoringType;
    matchResolveType: MatchResolveType;
    periodType: PeriodType;
    isDrawAvailable: boolean;
    priority: number;
    hidden: boolean;
    tooltipKey?: string;
};
