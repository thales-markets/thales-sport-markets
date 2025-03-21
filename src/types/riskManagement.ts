import { SgpBlocker, SgpBuilder } from 'overtime-utils';

export type RiskManagementData =
    | RiskManagementLeaguesAndTypes
    | RiskManagementBookmakers
    | RiskManagementSgpBlockers
    | RiskManagementSgpBuilders
    | RiskManagementSgp
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

export type RiskManagementSgpBlockers = SgpBlocker[];
export type RiskManagementSgpBuilders = SgpBuilder[];
export type RiskManagementSgp = { sgpBlockers: SgpBlocker[]; sgpBuilders: SgpBuilder[] };

export type SportsAmmRiskManagerData = {
    sgpOnLeagueIdEnabled: boolean;
};
