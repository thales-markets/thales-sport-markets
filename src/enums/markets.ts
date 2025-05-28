export enum StatusFilter {
    OPEN_MARKETS = 'OpenMarkets',
    ONGOING_MARKETS = 'OngoingMarkets',
    RESOLVED_MARKETS = 'ResolvedMarkets',
    PAUSED_MARKETS = 'PausedMarkets',
    CANCELLED_MARKETS = 'CancelledMarkets',
}

export enum SortDirection {
    NONE = 'none',
    ASC = 'asc',
    DESC = 'desc',
}

export enum SortType {
    DEFAULT = 'Chronological + Popularity',
    START_TIME = 'Chronological',
    PRIORITY = 'Popularity',
}

export enum SportFilter {
    Boosted = 'Promo',
    Live = 'Live',
    Favourites = 'Favourites',
    PlayerProps = 'PlayerProps',
    All = 'All',
    Soccer = 'Soccer',
    Football = 'Football',
    Basketball = 'Basketball',
    Baseball = 'Baseball',
    Hockey = 'Hockey',
    Fighting = 'Fighting',
    Tennis = 'Tennis',
    TableTennis = 'TableTennis',
    eSports = 'eSports',
    Rugby = 'Rugby',
    AussieRules = 'AussieRules',
    Volleyball = 'Volleyball',
    Handball = 'Handball',
    Waterpolo = 'Waterpolo',
    Cricket = 'Cricket',
    Motosport = 'Motosport',
    Golf = 'Golf',
    Darts = 'Darts',
    Politics = 'Politics',
    Futures = 'Futures',
}

export enum OddsType {
    AMERICAN = 'american-odds',
    DECIMAL = 'decimal-odds',
    AMM = 'implied-odds',
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
    RUNDOWN_SCHEDULED = 'STATUS_SCHEDULED',
    RUNDOWN_PRE_FIGHT = 'STATUS_PRE_FIGHT',
    RUNDOWN_FIGHTERS_WALKING = 'STATUS_FIGHTERS_WALKING',
    RUNDOWN_FIGHTERS_INTRODUCTION = 'STATUS_FIGHTERS_INTRODUCTION',
    RUNDOWN_END_OF_ROUND = 'STATUS_END_OF_ROUND',
    RUNDOWN_END_OF_FIGHT = 'STATUS_END_OF_FIGHT',
    RUNDOWN_OVERTIME = 'STATUS_OVERTIME',
    ENETPULSE_FINISHED = 'finished',
    ENETPULSE_INTERRUPTED = 'interrupted',
    OPTICODDS_LIVE = 'live',
    OPTICODDS_HALF = 'half',
    OPTICODDS_UNPLAYED = 'unplayed',
    OPTICODDS_COMPLETED = 'completed',
    OPTICODDS_SUSPENDED = 'suspended',
    OPTICODDS_DELAYED = 'delayed',
    CANCELED = 'cancelled', // the same for ENETPULSE and OPTICODDS
}

export enum MarketStatus {
    OPEN = 0,
    PAUSED = 1,
    IN_PROGRESS = 3,
    RESOLVED = 10,
    CANCELLED = 255,
}

export enum TicketErrorCode {
    NO_ERROS = 0,
    MAX_MATCHES = 1,
    OTHER_TYPES_WITH_PLAYER_PROPS = 2,
    SAME_PLAYER_DIFFERENT_TYPES = 3,
    PLAYER_PROPS_COMBINING_NOT_ENABLED = 4,
    FUTURES_COMBINING_NOT_SUPPORTED = 5,
    SGP_DIFFERENT_GAME = 6,
    SGP_LEAGUE_DISABLED = 7,
    SGP_MAX_MARKETS = 8,
}

export enum LiveTradingTicketStatus {
    PENDING,
    APPROVED,
    CREATED,
}

export enum LiveTradingFinalStatus {
    IN_PROGRESS,
    FAILED,
    SUCCESS,
}
