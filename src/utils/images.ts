import { League } from 'enums/sports';
import { LeagueMap } from '../constants/sports';
import { fixOneSideMarketCompetitorName } from './formatters/string';
import { getLeagueLabel, isInternationalLeague } from './sports';

export const getTeamImageSource = (team: string, league: League) => {
    const leagueLabel = getLeagueLabel(league);
    return league == League.TENNIS_WTA ||
        league == League.TENNIS_GS ||
        league == League.TENNIS_MASTERS ||
        league == League.SUMMER_OLYMPICS_TENNIS
        ? `/logos/Tennis/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.FORMULA1 || league == League.MOTOGP
        ? `/logos/${leagueLabel}/${fixOneSideMarketCompetitorName(team).replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.GOLF_H2H
        ? `/logos/PGA/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.GOLF_WINNER
        ? `/logos/PGA/${fixOneSideMarketCompetitorName(team).replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.BRAZIL_1
        ? `/logos/Brazil-Serie-A/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : isInternationalLeague(Number(league))
        ? `/logos/Countries/${team
              .trim()
              .replaceAll(' 7s', '')
              .replaceAll(' U23', '')
              .replaceAll(' 3x3', '')
              .replaceAll(' ', '-')
              .toLowerCase()}.svg`
        : league == League.ENGLAND_FA_CUP
        ? `/logos/EPL/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.FRANCE_CUP || league == League.FRANCE_SUPER_CUP
        ? `/logos/Ligue 1/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.SPAIN_CUP || league == League.SPAIN_SUPER_CUP
        ? `/logos/La Liga/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.ITALY_CUP || league == League.ITALY_SUPER_CUP
        ? `/logos/Serie A/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.GERMANY_CUP || league == League.GERMANY_SUPER_CUP
        ? `/logos/Bundesliga/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.PORTUGAL_LEAGUE_CUP || league == League.PORTUGAL_CUP
        ? `/logos/Primeira Liga/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.BRAZIL_CUP
        ? `/logos/Brazil-Serie-A/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.US_ELECTION
        ? `/logos/Countries/united-states-of-america.svg`
        : league == League.NFL_FUTURES
        ? `/logos/NFL/nfl.webp`
        : league == League.NBA_FUTURES
        ? `/logos/NBA/nba.webp`
        : league == League.EPL_FUTURES
        ? `/logos/EPL/epl.webp`
        : league == League.ATP_FUTURES
        ? `/logos/Countries/ao.webp`
        : league == League.NETHERLANDS_CUP
        ? `/logos/Eredivisie/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : `/logos/${leagueLabel}/${team.trim().replaceAll(' ', '-').replaceAll('/', '-').toLowerCase()}.webp`;
};

const OVERTIME_LOGO = '/logos/overtime-logo.png';
const OVERTIME_LOGO_DARK = '/logos/overtime-logo-dark.svg';
const PROFILE_SILHOUETTE = '/profile-silhouette.svg';

export const getOnImageError = (setSrc: (src: string) => void, league: League, isDark = false) => () => {
    setSrc(LeagueMap[league]?.logo || (isDark ? OVERTIME_LOGO_DARK : OVERTIME_LOGO));
};

export const getOnPlayerImageError = (setSrc: (src: string) => void) => () => {
    setSrc(PROFILE_SILHOUETTE);
};

export const getErrorImage = (league: League) => {
    return LeagueMap[league]?.logo || OVERTIME_LOGO;
};

export const getLeagueLogoClass = (league: League) => {
    return LeagueMap[league]?.logoClass || 'icon-homepage league--overtime';
};

export const getLeagueFlagSource = (tagId: number | any) => {
    switch (tagId) {
        case League.NCAAF:
        case League.NFL:
        case League.MLB:
        case League.NBA:
        case League.NCAAB:
        case League.NHL:
        case League.WNBA:
        case League.MLS:
        case League.US_ELECTION:
        case League.NFL_FUTURES:
        case League.NBA_FUTURES:
        case League.NHL_FUTURES:
            return `/logos/Countries/united-states-of-america.svg`;
        case League.EPL:
        case League.ENGLAND_CHAMPIONSHIP:
        case League.ENGLAND_EFL_CUP:
        case League.ENGLAND_LEGAUE_1:
        case League.EPL_FUTURES:
        case League.ENGLAND_FA_CUP:
            return `/logos/Countries/england.svg`;
        case League.LIGUE_ONE:
        case League.LIGUE_2:
        case League.FRANCE_LNB_PRO_A:
        case League.LIGUE_ONE_FUTURES:
        case League.FRANCE_SUPER_CUP:
        case League.FRANCE_CUP:
            return `/logos/Countries/france.svg`;
        case League.BUNDESLIGA:
        case League.BUNDESLIGA_2:
        case League.GERMANY_BBL:
        case League.BUNDESLIGA_FUTURES:
        case League.GERMANY_SUPER_CUP:
            return `/logos/Countries/germany.svg`;
        case League.LA_LIGA:
        case League.LA_LIGA_2:
        case League.SPAIN_LIGA_ACB:
        case League.LA_LIGA_FUTURES:
        case League.SPAIN_SUPER_CUP:
            return `/logos/Countries/spain.svg`;
        case League.SERIE_A:
        case League.SERIE_B:
        case League.ITALY_LEGA_BASKET_SERIE_A:
        case League.SERIE_A_FUTURES:
        case League.ITALY_SUPER_CUP:
            return `/logos/Countries/italy.svg`;
        case League.J1_LEAGUE:
            return `/logos/Countries/japan.svg`;
        case League.IPL:
            return `/logos/Countries/india.svg`;
        case League.EREDIVISIE:
        case League.NETHERLANDS_CUP:
            return `/logos/Countries/netherlands.svg`;
        case League.PRIMEIRA_LIGA:
        case League.PORTUGAL_LEAGUE_CUP:
        case League.PORTUGAL_CUP:
            return `/logos/Countries/portugal.svg`;
        case League.T20_BLAST:
            return `/logos/Countries/united-kingdom.svg`;
        case League.SAUDI_PROFESSIONAL_LEAGUE:
            return `/logos/Countries/saudi-arabia.svg`;
        case League.BRAZIL_1:
        case League.BRAZIL_CUP:
            return `/logos/Countries/brazil.svg`;
        case League.LIGA_MX:
            return `/logos/Countries/mexico.svg`;
        case League.SCOTLAND_PREMIERSHIP:
            return `/logos/Countries/scotland.svg`;
        case League.BELGIUM_LEAGUE:
            return `/logos/Countries/belgium.svg`;
        case League.CZECH_LEAGUE:
            return `/logos/Countries/czech-republic.svg`;
        case League.CHILE_PRIMERA:
            return `/logos/Countries/chile.svg`;
        case League.FINLAND_LEAGUE:
            return `/logos/Countries/finland.svg`;
        case League.ARGENTINA_PRIMERA:
            return `/logos/Countries/argentina.svg`;
        case League.RUSSIA_PREMIER:
            return `/logos/Countries/russia.svg`;
        case League.TURKEY_SUPER_LEAGUE:
            return `/logos/Countries/turkey.svg`;
        case League.SERBIA_SUPER_LEAGUE:
            return `/logos/Countries/serbia.svg`;
        case League.GREECE_SUPER_LEAGUE:
            return `/logos/Countries/greece.svg`;
        case League.INDIA_PREMIER:
        case League.INDIA_SUPER_LEAGUE:
            return `/logos/Countries/india.svg`;
        case League.CHINA_SUPER_LEAGUE:
            return `/logos/Countries/china.svg`;
        case League.AUSTRALIA_A_LEAGUE:
            return `/logos/Countries/australia.svg`;
        case League.SWITZERLAND_SUPER_LEAGUE:
            return `/logos/Countries/switzerland.svg`;
        case League.AUSTRIA_BUNDESLIGA:
            return `/logos/Countries/austria.svg`;
        case League.DENMARK_SUPER_LEAGUE:
            return `/logos/Countries/denmark.svg`;
        case League.POLAND_LEAGUE:
            return `/logos/Countries/poland.svg`;
        case League.SWEDEN_LEAGUE:
            return `/logos/Countries/sweden.svg`;
        case League.COLOMBIA_PRIMERA_A:
            return `/logos/Countries/colombia.svg`;
        case League.URUGUAY_PRIMERA_DIVISION:
            return `/logos/Countries/uruguay.svg`;
        case League.UEFA_CL:
        case League.UEFA_EL:
        case League.UEFA_EURO:
        case League.UEFA_EURO_U21:
        case League.UEFA_NATIONS_LEAGUE:
        case League.UEFA_CONFERENCE_LEAGUE:
        case League.UEFA_CHAMPIONS_LEAGUE_QUALIFICATION:
        case League.UEFA_EUROPA_LEAGUE_QUALIFICATION:
        case League.UEFA_CONFERENCE_LEAGUE_QUALIFICATION:
        case League.UEFA_SUPER_CUP:
        case League.UEFA_CHAMPIONS_LEAGUE_FUTURES:
        case League.EUROLEAGUE_FUTURES:
            return `/logos/Countries/europe.svg`;
        case League.EUROLEAGUE:
        case League.EUROCUP:
            return `/logos/Countries/europe.svg`;
        case League.FRANCE_CUP:
            return `/logos/Countries/france.svg`;
        case League.SPAIN_CUP:
            return `/logos/Countries/spain.svg`;
        case League.GERMANY_CUP:
            return `/logos/Countries/germany.svg`;
        case League.ITALY_CUP:
            return `/logos/Countries/italy.svg`;
        case League.SUMMER_OLYMPICS_BASKETBALL:
        case League.SUMMER_OLYMPICS_BASKETBALL_WOMEN:
        case League.SUMMER_OLYMPICS_BASKETBALL_3X3:
        case League.SUMMER_OLYMPICS_BASKETBALL_3X3_WOMEN:
        case League.SUMMER_OLYMPICS_SOCCER:
        case League.SUMMER_OLYMPICS_SOCCER_WOMEN:
        case League.SUMMER_OLYMPICS_RUGBY:
        case League.SUMMER_OLYMPICS_RUGBY_WOMEN:
        case League.SUMMER_OLYMPICS_VOLEYBALL:
        case League.SUMMER_OLYMPICS_VOLEYBALL_WOMEN:
        case League.SUMMER_OLYMPICS_HANDBALL:
        case League.SUMMER_OLYMPICS_HANDBALL_WOMEN:
        case League.SUMMER_OLYMPICS_WATERPOLO:
        case League.SUMMER_OLYMPICS_BEACH_VOLEYBALL:
        case League.SUMMER_OLYMPICS_BEACH_VOLEYBALL_WOMEN:
        case League.SUMMER_OLYMPICS_HOCKEY:
        case League.SUMMER_OLYMPICS_HOCKEY_WOMEN:
        case League.SUMMER_OLYMPICS_TENNIS:
        case League.SUMMER_OLYMPICS_TABLE_TENNIS:
            return `/logos/Countries/paris2024.png`;
        case League.COPA_LIBERTADORES:
            return '/logos/Countries/south-america.webp';
        case League.CHINA_CBA:
            return `/logos/Countries/china.svg`;
        case League.AUSTRALIA_NBL:
            return `/logos/Countries/australia.svg`;
        case League.AFC_CHAMPIONS_LEAGUE:
            return `/logos/Countries/afc-champions-league.webp`;
        case League.THAILAND_LEAGUE_1:
            return `/logos/Countries/thailand.svg`;
        case League.ATP_FUTURES:
            return `/logos/Countries/atp.webp`;
        default:
            return `/logos/Countries/world.svg`;
    }
};
