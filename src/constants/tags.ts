import { Tags, SportsMap, SportsTagsMap } from 'types/markets';

export const TAGS_LIST: Tags = [
    { id: 9001, label: 'NCAA Football', logo: `/logos/leagueLogos/ncaa.png` },
    { id: 9002, label: 'NFL', logo: `/logos/leagueLogos/nfl.png` },
    { id: 9003, label: 'MLB', logo: `/logos/leagueLogos/mlb.svg` },
    { id: 9004, label: 'NBA', logo: `/logos/leagueLogos/nba.svg` },
    { id: 9005, label: 'NCAA Basketball' },
    { id: 9006, label: 'NHL', logo: `/logos/leagueLogos/nhl.png` },
    { id: 9007, label: 'UFC', logo: '/logos/ufc-logo.png' },
    { id: 9008, label: 'WNBA' },
    { id: 9010, label: 'MLS', logo: `/logos/leagueLogos/mls.png` },
    { id: 9011, label: 'EPL', logo: `/logos/leagueLogos/EPL.png` },
    { id: 9012, label: 'Ligue 1', logo: `/logos/leagueLogos/Ligue1.png` },
    { id: 9013, label: 'Bundesliga', logo: '/logos/leagueLogos/bundesliga.png' },
    { id: 9014, label: 'La Liga', logo: `/logos/leagueLogos/LaLiga.png` },
    { id: 9015, label: 'Serie A', logo: `/logos/leagueLogos/seriea.png` },
    { id: 9016, label: 'UEFA Champions League', logo: `/logos/leagueLogos/ucl-white.png` },
    { id: 9100, label: 'Formula1', logo: '/logos/leagueLogos/f1.png' },
    { id: 9101, label: 'MotoGP', logo: `/logos/leagueLogos/motogp.png` },
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
    9100: 'Formula1',
    9101: 'MotoGP',
};

export const SPORTS_TAGS_MAP: SportsTagsMap = {
    Football: [9001, 9002],
    Baseball: [9003],
    Basketball: [9004, 9005, 9008],
    Hockey: [9006],
    Soccer: [9010, 9011, 9012, 9013, 9014, 9015, 9016],
    UFC: [9007],
    Formula1: [9100],
    MotoGP: [9101],
};
