import { League, MatchResolveType, PeriodType, Provider, ScoringType, Sport } from 'enums/sports';

export type LeagueInfo = {
    sport: Sport;
    id: League;
    label: string;
    logo?: string;
    logoClass?: string;
    provider: Provider;
    scoringType: ScoringType;
    matchResolveType: MatchResolveType;
    periodType: PeriodType;
    isDrawAvailable: boolean;
    priority: number;
    hidden: boolean;
    favourite: boolean;
    live: boolean;
    tooltipKey?: string;
};
