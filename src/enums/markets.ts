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
    STATUS_SCHEDULED = 'STATUS_SCHEDULED',
    RUNDOWN_OVERTIME = 'STATUS_OVERTIME',
    ENETPULSE_FINISHED = 'finished',
    ENETPULSE_INTERRUPTED = 'interrupted',
    ENETPULSE_CANCELED = 'cancelled',
}

export enum TicketErrorCode {
    NO_ERROS = 0,
    MAX_MATCHES = 1,
    OTHER_TYPES_WITH_PLAYER_PROPS = 2,
    SAME_PLAYER_DIFFERENT_TYPES = 3,
    PLAYER_PROPS_COMBINING_NOT_ENABLED = 4,
}
