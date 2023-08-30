export enum GlobalFiltersEnum {
    OpenMarkets = 'OpenMarkets',
    PendingMarkets = 'PendingMarkets',
    ResolvedMarkets = 'ResolvedMarkets',
    Canceled = 'Canceled',
}

export enum SortDirection {
    NONE,
    ASC,
    DESC,
}

export enum SportFilterEnum {
    Favourites = 'Favourites',
    All = 'All',
    Soccer = 'Soccer',
    Football = 'Football',
    Basketball = 'Basketball',
    Baseball = 'Baseball',
    Hockey = 'Hockey',
    MMA = 'MMA',
    Tennis = 'Tennis',
    eSports = 'eSports',
    Cricket = 'Cricket',
    Motosport = 'Motosport',
    Golf = 'Golf',
}

export enum OddsType {
    American = 'american-odds',
    Decimal = 'decimal-odds',
    AMM = 'normalized-implied-odds',
}

export enum ContractSGPOrder {
    MONEYLINETOTALS = 0,
    MONEYLINESPREAD = 1,
    SPREADTOTALS = 2,
}

export enum PositionName {
    home = 'home',
    away = 'away',
    draw = 'draw',
}

export enum Position {
    HOME = 0,
    AWAY = 1,
    DRAW = 2,
}

export enum DoubleChanceMarketType {
    HOME_TEAM_NOT_TO_LOSE = 'HomeTeamNotToLose',
    NO_DRAW = 'NoDraw',
    AWAY_TEAM_NOT_TO_LOSE = 'AwayTeamNotToLose',
}

export enum BetType {
    WINNER = 0,
    SPREAD = 10001,
    TOTAL = 10002,
    DOUBLE_CHANCE = 10003,
    PLAYER_PROPS_HOMERUNS = 11010,
    PLAYER_PROPS_STRIKEOUTS = 11019,
}

export enum ParlayErrorCode {
    NO_ERROS = 0,
    MAX_MATCHES = 1,
    SAME_TEAM_TWICE = 2,
    MAX_DOUBLE_CHANCES = 3,
    MAX_COMBINED_MARKETS = 4,
    MAX_NUMBER_OF_MARKETS_WITH_COMBINED_MARKETS = 5,
    SAME_EVENT_PARTICIPANT = 6,
    UNIQUE_TOURNAMENT_PLAYERS = 7,
}

export enum CombinedPositionsMatchingCode {
    SAME_POSITIONS = 0,
    SAME_MARKET_ADDRESSES_NOT_POSITIONS = 2,
    SAME_POSITIONS_DIFFERENT_ODDS = 3,
    NOTHING_COMMON = 4,
    SAME_PARENT_MARKET = 5,
}
