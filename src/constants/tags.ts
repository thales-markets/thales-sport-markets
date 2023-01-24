import { Tags, SportsMap, SportsTagsMap } from 'types/markets';

export const TAGS_LIST: Tags = [
    {
        id: 9001,
        label: 'NCAA Football',
        logo: `/logos/leagueLogos/ncaa.png`,
        logoClass: 'icon-league league--ncaa',
        favourite: false,
    },
    {
        id: 9002,
        label: 'NFL',
        logo: `/logos/leagueLogos/nfl.png`,
        logoClass: 'icon-league league--nfl',
        favourite: false,
    },
    {
        id: 9003,
        label: 'MLB',
        logo: `/logos/leagueLogos/mlb.svg`,
        logoClass: 'icon-league league--mlb',
        favourite: false,
    },
    {
        id: 9004,
        label: 'NBA',
        logo: `/logos/leagueLogos/nba.svg`,
        logoClass: 'icon-league league--nba',
        favourite: false,
    },
    { id: 9005, label: 'NCAA Basketball', logoClass: 'icon-league league--ncaa', favourite: false },
    {
        id: 9006,
        label: 'NHL',
        logo: `/logos/leagueLogos/nhl.png`,
        logoClass: 'icon-league league--nhl',
        favourite: false,
    },
    {
        id: 9007,
        label: 'UFC',
        logo: '/logos/ufc-logo.png',
        logoClass: 'icon-league league--ufc',
        favourite: false,
    },
    { id: 9008, label: 'WNBA', logoClass: 'icon-league league--wnba', favourite: false },
    {
        id: 9010,
        label: 'MLS',
        logo: `/logos/leagueLogos/mls.png`,
        logoClass: 'icon-league league--mls',
        favourite: false,
    },
    {
        id: 9011,
        label: 'EPL',
        logo: `/logos/leagueLogos/EPL.png`,
        logoClass: 'icon-league league--epl',
        favourite: false,
    },
    {
        id: 9012,
        label: 'Ligue 1',
        logo: `/logos/leagueLogos/Ligue1.png`,
        logoClass: 'icon-league league--ligue1',
        favourite: false,
    },
    {
        id: 9013,
        label: 'Bundesliga',
        logo: '/logos/leagueLogos/bundesliga.png',
        logoClass: 'icon-league league--bundesliga',
        favourite: false,
    },
    {
        id: 9014,
        label: 'La Liga',
        logo: `/logos/leagueLogos/LaLiga.png`,
        logoClass: 'icon-league league--laliga',
        favourite: false,
    },
    {
        id: 9015,
        label: 'Serie A',
        logo: `/logos/leagueLogos/seriea.png`,
        logoClass: 'icon-league league--seriea',
        favourite: false,
    },
    {
        id: 9016,
        label: 'UEFA Champions League',
        logo: `/logos/leagueLogos/ucl-white.png`,
        logoClass: 'icon-league league--ucl',
        favourite: false,
    },
    {
        id: 9018,
        label: 'FIFA World Cup',
        logo: ``,
        logoClass: 'icon-league icon-league--fifa-world-cup',
        favourite: false,
    },
    {
        id: 9100,
        label: 'Formula 1',
        logo: '/logos/leagueLogos/f1.png',
        logoClass: 'icon-league league--f1',
        favourite: false,
    },
    {
        id: 9101,
        label: 'MotoGP',
        logo: `/logos/leagueLogos/motogp.png`,
        logoClass: 'icon-league league--motogp',
        favourite: false,
    },
];

export const SPORTS_MAP: SportsMap = {
    9001: 'Football',
    9002: 'Football',
    9003: 'Baseball',
    9004: 'Basketball',
    9005: 'Basketball',
    9006: 'Hockey',
    9007: 'UFC',
    9008: 'Basketball',
    9010: 'Soccer',
    9011: 'Soccer',
    9012: 'Soccer',
    9013: 'Soccer',
    9014: 'Soccer',
    9015: 'Soccer',
    9016: 'Soccer',
    9018: 'Soccer',
    9100: 'Motosport',
    9101: 'Motosport',
};

export const TAGS_OF_MARKETS_WITHOUT_DRAW_ODDS = [9001, 9002, 9003, 9004, 9005, 9006, 9008, 9007, 9100, 9101];

export const SPORTS_TAGS_MAP: SportsTagsMap = {
    Football: [9001, 9002],
    Baseball: [9003],
    Basketball: [9004, 9005, 9008],
    Hockey: [9006],
    Soccer: [9010, 9011, 9012, 9013, 9014, 9015, 9016, 9018],
    UFC: [9007],
    Motosport: [9100, 9101],
};

export enum TAGS_FLAGS {
    NCAA_FOOTBALL = 9001,
    NFL = 9002,
    MLB = 9003,
    NBA = 9004,
    NCAA_BASKETBALL = 9005,
    NHL = 9006,
    UFC = 9007,
    WNBA = 9008,
    MLS = 9010,
    EPL = 9011,
    LIGUE_ONE = 9012,
    BUNDESLIGA = 9013,
    LA_LIGA = 9014,
    SERIE_A = 9015,
    UEFA_CL = 9016,
    FORMULA1 = 9100,
    MOTOGP = 9101,
}

export const MLS_TAG = 9010;
export const FIFA_WC_TAG = 9018;

export const PERSON_COMPETITIONS = [9007, 9100, 9101];

export enum BetType {
    WINNER = 0,
    SPREAD = 10001,
    TOTAL = 10002,
    DOUBLE_CHANCE = 10003,
}

export const BetTypeNameMap: Record<BetType, string> = {
    [BetType.WINNER]: 'winner',
    [BetType.SPREAD]: 'spread',
    [BetType.TOTAL]: 'total',
    [BetType.DOUBLE_CHANCE]: 'double-chance',
};

export enum DoubleChanceMarketType {
    HOME_TEAM_NOT_TO_LOSE = 'HomeTeamNotToLose',
    NO_DRAW = 'NoDraw',
    AWAY_TEAM_NOT_TO_LOSE = 'AwayTeamNotToLose',
}

export const SCORING_MAP: SportsMap = {
    9001: 'points',
    9002: 'points',
    9003: 'points',
    9004: 'points',
    9005: 'points',
    9006: 'goals',
    9007: '',
    9008: 'points',
    9010: 'goals',
    9011: 'goals',
    9012: 'goals',
    9013: 'goals',
    9014: 'goals',
    9015: 'goals',
    9016: 'goals',
    9018: 'goals',
    9100: '',
    9101: '',
};

export const MATCH_RESOLVE_MAP: SportsMap = {
    9001: 'overtime',
    9002: 'overtime',
    9003: 'overtime',
    9004: 'overtime',
    9005: 'overtime',
    9006: 'overtime',
    9007: '',
    9008: 'overtime',
    9010: 'regular',
    9011: 'regular',
    9012: 'regular',
    9013: 'regular',
    9014: 'regular',
    9015: 'regular',
    9016: 'regular',
    9018: 'regular',
    9100: '',
    9101: '',
};

export const SPORT_PERIODS_MAP: SportsMap = {
    9001: 'quarter',
    9002: 'quarter',
    9003: 'inning',
    9004: 'quarter',
    9005: 'quarter',
    9006: 'period',
    9007: 'round',
    9008: 'quarter',
    9010: 'half',
    9011: 'half',
    9012: 'half',
    9013: 'half',
    9014: 'half',
    9015: 'half',
    9016: 'half',
    9018: 'half',
};
