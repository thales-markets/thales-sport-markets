export type RiskManagementData = RiskManagementLeaguesAndTypes | RiskManagementBookmakers | object;

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

export type SportsAmmRiskManagerData = {
    sgpOnLeagueIdEnabled: boolean;
};
