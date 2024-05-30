export enum StatusFilter {
    OPEN_MARKETS = 'OpenMarkets',
    ONGOING_MARKETS = 'OngoingMarkets',
    RESOLVED_MARKETS = 'ResolvedMarkets',
    PAUSED_MARKETS = 'PausedMarkets',
    CANCELLED_MARKETS = 'CancelledMarkets',
}

export enum SortDirection {
    NONE,
    ASC,
    DESC,
}

export enum SportFilter {
    Live = 'Live',
    Favourites = 'Favourites',
    All = 'All',
    Soccer = 'Soccer',
    Football = 'Football',
    Basketball = 'Basketball',
    Baseball = 'Baseball',
    Hockey = 'Hockey',
    Fighting = 'Fighting',
    Tennis = 'Tennis',
    eSports = 'eSports',
    Cricket = 'Cricket',
    // Motosport = 'Motosport',
    Golf = 'Golf',
}

export enum OddsType {
    AMERICAN = 'american-odds',
    DECIMAL = 'decimal-odds',
    AMM = 'normalized-implied-odds',
}

export enum Position {
    HOME = 0,
    AWAY = 1,
    DRAW = 2,
}

export enum GameStatus {
    RUNDOWN_FINAL = 'STATUS_FINAL',
    RUNDOWN_FULL_TIME = 'STATUS_FULL_TIME',
    RUNDOWN_HALF_TIME = 'STATUS_HALFTIME',
    RUNDOWN_POSTPONED = 'STATUS_POSTPONED',
    RUNDOWN_CANCELED = 'STATUS_CANCELED',
    RUNDOWN_DELAYED = 'STATUS_DELAYED',
    RUNDOWN_RAIN_DELAY = 'STATUS_RAIN_DELAY',
    RUNDOWN_ABANDONED = 'STATUS_ABANDONED',
    RUNDOWN_OVERTIME = 'STATUS_OVERTIME',
    ENETPULSE_FINISHED = 'finished',
    ENETPULSE_INTERRUPTED = 'interrupted',
    ENETPULSE_CANCELED = 'cancelled',
}

export enum TicketErrorCode {
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
