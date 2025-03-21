export enum RiskManagementConfig {
    TEAMS = 'teams',
    BOOKMAKERS = 'bookmakers',
    SPREADS = 'spreads',
    LEAGUES = 'leagues',
    SGP = 'sgp',
    SGP_BLOCKERS = 'sgpBlockers',
    SGP_BUILDERS = 'sgpBuilders',
}

export enum RiskManagementRole {
    ROOT_SETTING,
    RISK_MANAGING,
    MARKET_RESOLVING,
    TICKET_PAUSER,
}
