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
    // Motosport = 'Motosport',
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
    PLAYER_PROPS_PASSING_YARDS = 11051,
    PLAYER_PROPS_PASSING_TOUCHDOWNS = 11052,
    PLAYER_PROPS_RUSHING_YARDS = 11053,
    PLAYER_PROPS_RECEIVING_YARDS = 11057,
    PLAYER_PROPS_TOUCHDOWNS = 11055,
    PLAYER_PROPS_FIELD_GOALS_MADE = 11060,
    PLAYER_PROPS_PITCHER_HITS_ALLOWED = 11047,
    PLAYER_PROPS_POINTS = 11029,
    PLAYER_PROPS_SHOTS = 11097,
    PLAYER_PROPS_GOALS = 11086,
    PLAYER_PROPS_HITS_RECORDED = 11012,
    PLAYER_PROPS_REBOUNDS = 11035,
    PLAYER_PROPS_ASSISTS = 11039,
    PLAYER_PROPS_DOUBLE_DOUBLE = 11087,
    PLAYER_PROPS_TRIPLE_DOUBLE = 11088,
    PLAYER_PROPS_RECEPTIONS = 11058,
    PLAYER_PROPS_FIRST_TOUCHDOWN = 11049,
    PLAYER_PROPS_LAST_TOUCHDOWN = 11056,
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
    ADDING_PLAYER_PROPS_ALREADY_HAVE_POSITION_OF_SAME_MARKET = 8,
    SAME_GAME_OTHER_PLAYER_PROPS_TYPE = 9,
    COMBINE_REGULAR_WITH_COMBINED_POSITIONS = 10,
}

export enum CombinedPositionsMatchingCode {
    SAME_POSITIONS = 0,
    SAME_MARKETS = 1,
    SAME_MARKET_ADDRESSES_NOT_POSITIONS = 2,
    SAME_POSITIONS_DIFFERENT_ODDS = 3,
    NOTHING_COMMON = 4,
    SAME_PARENT_MARKET = 5,
}
export const PLAYER_PROPS_BET_TYPES = [
    BetType.PLAYER_PROPS_HOMERUNS,
    BetType.PLAYER_PROPS_STRIKEOUTS,
    BetType.PLAYER_PROPS_PASSING_YARDS,
    BetType.PLAYER_PROPS_PASSING_TOUCHDOWNS,
    BetType.PLAYER_PROPS_RUSHING_YARDS,
    BetType.PLAYER_PROPS_RECEIVING_YARDS,
    BetType.PLAYER_PROPS_TOUCHDOWNS,
    BetType.PLAYER_PROPS_FIELD_GOALS_MADE,
    BetType.PLAYER_PROPS_PITCHER_HITS_ALLOWED,
    BetType.PLAYER_PROPS_POINTS,
    BetType.PLAYER_PROPS_SHOTS,
    BetType.PLAYER_PROPS_GOALS,
    BetType.PLAYER_PROPS_HITS_RECORDED,
    BetType.PLAYER_PROPS_REBOUNDS,
    BetType.PLAYER_PROPS_ASSISTS,
    BetType.PLAYER_PROPS_DOUBLE_DOUBLE,
    BetType.PLAYER_PROPS_TRIPLE_DOUBLE,
    BetType.PLAYER_PROPS_RECEPTIONS,
    BetType.PLAYER_PROPS_FIRST_TOUCHDOWN,
    BetType.PLAYER_PROPS_LAST_TOUCHDOWN,
];

export const ONE_SIDER_PLAYER_PROPS_BET_TYPES = [
    BetType.PLAYER_PROPS_TOUCHDOWNS,
    BetType.PLAYER_PROPS_GOALS,
    BetType.PLAYER_PROPS_FIRST_TOUCHDOWN,
    BetType.PLAYER_PROPS_LAST_TOUCHDOWN,
];
export const SPECIAL_YES_NO_BET_TYPES = [BetType.PLAYER_PROPS_DOUBLE_DOUBLE, BetType.PLAYER_PROPS_TRIPLE_DOUBLE];
