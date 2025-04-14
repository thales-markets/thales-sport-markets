import { SgpBlocker, SgpBuilder } from 'overtime-utils';

export type RiskManagementData =
    | RiskManagementLeaguesAndTypes
    | RiskManagementBookmakers
    | RiskManagementSgpBlockers
    | RiskManagementSgpBuilders
    | object;

export type RiskManagementLeaguesAndTypes = {
    leagues: RiskManagementLeague[];
    spreadTypes: string[];
    totalTypes: string[];
};

type RiskManagementLeague = {
    leagueId: number;
    marketName: string;
    enabled: boolean;
};

type RiskManagementBookmakers = { bookmakers: RiskManagementBookmaker[] };

type RiskManagementBookmaker = {
    sportName: string;
    leagueId: number;
    primaryBookmaker: string;
    secondaryBookmaker: string;
    tertiaryBookmaker: string;
};

export type RiskManagementSgpBlockers = { sgpBlockers: SgpBlocker[] };
export type RiskManagementSgpBuilders = { sgpBuilders: SgpBuilder[] };

export type SportsAmmRiskManagerData = {
    sgpOnLeagueIdEnabled: boolean;
};
