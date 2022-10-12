import { Tags, SportsMap, SportsTagsMap } from 'types/markets';

export const TAGS_LIST: Tags = [
    { id: 9001, label: 'NCAA Football', logo: `/logos/leagueLogos/ncaa.png`, logoClass: 'league league--ncaa' },
    { id: 9002, label: 'NFL', logo: `/logos/leagueLogos/nfl.png`, logoClass: 'league league--nfl' },
    { id: 9003, label: 'MLB', logo: `/logos/leagueLogos/mlb.svg`, logoClass: 'league league--mlb' },
    { id: 9004, label: 'NBA', logo: `/logos/leagueLogos/nba.svg`, logoClass: 'league league--nba' },
    { id: 9005, label: 'NCAA Basketball', logoClass: 'league league--ncaa' },
    { id: 9006, label: 'NHL', logo: `/logos/leagueLogos/nhl.png`, logoClass: 'league league--nhl' },
    { id: 9007, label: 'UFC', logo: '/logos/ufc-logo.png', logoClass: 'league league--ufc' },
    { id: 9008, label: 'WNBA', logoClass: 'league league--wnba' },
    { id: 9010, label: 'MLS', logo: `/logos/leagueLogos/mls.png`, logoClass: 'league league--mls' },
    { id: 9011, label: 'EPL', logo: `/logos/leagueLogos/EPL.png`, logoClass: 'league league--epl' },
    { id: 9012, label: 'Ligue 1', logo: `/logos/leagueLogos/Ligue1.png`, logoClass: 'league league--ligue1' },
    {
        id: 9013,
        label: 'Bundesliga',
        logo: '/logos/leagueLogos/bundesliga.png',
        logoClass: 'league league--bundesliga',
    },
    { id: 9014, label: 'La Liga', logo: `/logos/leagueLogos/LaLiga.png`, logoClass: 'league league--laliga' },
    { id: 9015, label: 'Serie A', logo: `/logos/leagueLogos/seriea.png`, logoClass: 'league league--seriea' },
    {
        id: 9016,
        label: 'UEFA Champions League',
        logo: `/logos/leagueLogos/ucl-white.png`,
        logoClass: 'league league--ucl',
    },
    { id: 9100, label: 'Formula1', logo: '/logos/leagueLogos/f1.png', logoClass: 'league league--f1' },
    { id: 9101, label: 'MotoGP', logo: `/logos/leagueLogos/motogp.png`, logoClass: 'league league--motogp' },
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
    9100: 'Formula1',
    9101: 'MotoGP',
};

export const TAGS_OF_MARKETS_WITHOUT_DRAW_ODDS = [9002, 9003, 9004, 9005, 9006, 9008, 9007, 9100, 9101];

export const SPORTS_TAGS_MAP: SportsTagsMap = {
    Football: [9001, 9002],
    Baseball: [9003],
    Basketball: [9004, 9005, 9008],
    Hockey: [9006],
    Soccer: [9010, 9011, 9012, 9013, 9014, 9015, 9016, 9018],
    UFC: [9007],
    Formula1: [9100],
    MotoGP: [9101],
};
