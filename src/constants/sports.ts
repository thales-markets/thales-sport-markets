import { League, MarketType, Sport } from 'overtime-utils';

export const UFC_LEAGUE_IDS = [701, 702, 703, 704];

// set empty array to disable all leagues to combine on regular bet
export const PLAYER_PROPS_COMBINING_ENABLED_LEAGUES: League[] = [
    League.NBA,
    League.NCAAB,
    League.WNBA,
    League.EUROLEAGUE,
];

export const PLAYER_PROPS_MARKETS_PER_SPORT_MAP: Record<Sport, MarketType[]> = {
    [Sport.SOCCER]: [
        MarketType.PLAYER_PROPS_OVER_GOALS,
        MarketType.PLAYER_PROPS_TOTAL_SHOTS,
        MarketType.PLAYER_PROPS_ASSISTS,
    ],
    [Sport.FOOTBALL]: [],
    [Sport.BASKETBALL]: [
        MarketType.PLAYER_PROPS_POINTS,
        MarketType.PLAYER_PROPS_REBOUNDS,
        MarketType.PLAYER_PROPS_ASSISTS,
    ],
    [Sport.BASEBALL]: [],
    [Sport.HOCKEY]: [MarketType.PLAYER_PROPS_POINTS, MarketType.PLAYER_PROPS_SHOTS, MarketType.PLAYER_PROPS_ASSISTS],
    [Sport.FIGHTING]: [],
    [Sport.TENNIS]: [
        MarketType.PLAYER_PROPS_ACES,
        MarketType.PLAYER_PROPS_BREAK_POINTS_WON,
        MarketType.PLAYER_PROPS_DOUBLE_FAULTS,
    ],
    [Sport.TABLE_TENNIS]: [],
    [Sport.ESPORTS]: [],
    [Sport.RUGBY]: [],
    [Sport.AUSSIE_RULES]: [],
    [Sport.VOLLEYBALL]: [],
    [Sport.HANDBALL]: [],
    [Sport.WATERPOLO]: [],
    [Sport.CRICKET]: [MarketType.PLAYER_PROPS_RUNS, MarketType.PLAYER_PROPS_FOURS, MarketType.PLAYER_PROPS_SIXES],
    [Sport.DARTS]: [],
    [Sport.MOTOSPORT]: [],
    [Sport.GOLF]: [],
    [Sport.POLITICS]: [],
    [Sport.FUTURES]: [],
    [Sport.EMPTY]: [],
};

// IMPORTANT: first element of MarketType[] must be unique for that entry
export const PLAYER_PROPS_MARKETS_PER_PROP_MAP: Record<number, MarketType[]> = {
    [MarketType.PLAYER_PROPS_PASSING_YARDS]: [
        MarketType.PLAYER_PROPS_PASSING_YARDS,
        MarketType.PLAYER_PROPS_PASSING_TOUCHDOWNS,
        MarketType.PLAYER_PROPS_TOUCHDOWNS_SCORER,
    ],
    [MarketType.PLAYER_PROPS_RECEIVING_YARDS]: [
        MarketType.PLAYER_PROPS_RUSHING_YARDS,
        MarketType.PLAYER_PROPS_RECEIVING_YARDS,
        MarketType.PLAYER_PROPS_TOUCHDOWNS_SCORER,
    ],
};

export const PLAYER_PROPS_SPECIAL_SPORTS = [Sport.FOOTBALL];

// lower index => higher priority
export const LEAGUES_SORT_PRIORITY = [
    League.UEFA_CL,
    League.UEFA_CHAMPIONS_LEAGUE_FUTURES,
    League.UEFA_EL,
    League.EPL,
    League.EPL_FUTURES,
    League.LA_LIGA,
    League.LA_LIGA_FUTURES,
    League.SERIE_A,
    League.SERIE_A_FUTURES,
    League.BUNDESLIGA,
    League.BUNDESLIGA_FUTURES,
    League.LIGUE_ONE,
    League.LIGUE_ONE_FUTURES,
    League.NBA,
    League.NBA_SUMMER_LEAGUE,
    League.NBA_FUTURES,
    League.EUROLEAGUE,
    League.EUROLEAGUE_FUTURES,
    League.EUROCUP,
    League.NFL,
    League.NFL_FUTURES,
    League.NHL,
    League.NHL_FUTURES,
    League.MLB,
    League.MLB_FUTURES,
    League.USA_MLB_ALL_STAR,
    League.EREDIVISIE,
    League.PRIMEIRA_LIGA,
    League.BELGIUM_LEAGUE,
    League.NCAAF,
    League.NCAAB,
    League.NCAAB_FUTURES,
    League.SUMMER_OLYMPICS_TENNIS,
    League.TENNIS_GS,
    League.TENNIS_MASTERS,
    League.ATP_FUTURES,
    League.TENNIS_WTA,
    League.WTA_FUTURES,
    League.FORMULA1_FUTURES,
    League.PGA_FUTURES,
];
