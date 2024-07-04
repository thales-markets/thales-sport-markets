import { SupportedLanguages } from 'enums/languages';
import { League } from 'enums/sports';
import { LeagueMap } from '../constants/sports';
import { fixOneSideMarketCompetitorName } from './formatters/string';
import { getLeagueLabel, isInternationalLeague } from './sports';

export const getTeamImageSource = (team: string, league: League) => {
    const leagueLabel = getLeagueLabel(league);
    return league == League.TENNIS_GS || league == League.TENNIS_MASTERS
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
        ? `/logos/Countries/${team.trim().replaceAll(' ', '-').toLowerCase()}.svg`
        : league == League.ENGLAND_CUP
        ? `/logos/EPL/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.FRANCE_CUP
        ? `/logos/Ligue 1/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.SPAIN_CUP
        ? `/logos/La Liga/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.ITALY_CUP
        ? `/logos/Serie A/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : league == League.GERMANY_CUP
        ? `/logos/Bundesliga/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : `/logos/${leagueLabel}/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`;
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

export const getLanguageFlagSource = (language: SupportedLanguages | any) => {
    switch (language) {
        case SupportedLanguages.ENGLISH:
            return `/logos/Countries/united-kingdom.svg`;
        case SupportedLanguages.CHINESE:
            return `/logos/Countries/china.svg`;
        case SupportedLanguages.FRENCH:
            return `/logos/Countries/france.svg`;
        case SupportedLanguages.GERMAN:
            return `/logos/Countries/germany.svg`;
        case SupportedLanguages.SPANISH:
            return `/logos/Countries/spain.svg`;
        case SupportedLanguages.THAI:
            return `/logos/Countries/thailand.svg`;
        default:
            return `/logos/Countries/united-kingdom.svg`;
    }
};

export const getLeagueFlagSource = (tagId: number | any) => {
    switch (tagId) {
        case League.NCAAF:
            return `/logos/Countries/united-states-of-america.svg`;
        case League.NFL:
            return `/logos/Countries/united-states-of-america.svg`;
        case League.MLB:
            return `/logos/Countries/united-states-of-america.svg`;
        case League.NBA:
            return `/logos/Countries/united-states-of-america.svg`;
        case League.NCAAB:
            return `/logos/Countries/united-states-of-america.svg`;
        case League.NHL:
            return `/logos/Countries/united-states-of-america.svg`;
        case League.WNBA:
            return `/logos/Countries/united-states-of-america.svg`;
        case League.MLS:
            return `/logos/Countries/united-states-of-america.svg`;
        case League.EPL:
            return `/logos/Countries/england.svg`;
        case League.LIGUE_ONE:
            return `/logos/Countries/france.svg`;
        case League.BUNDESLIGA:
            return `/logos/Countries/germany.svg`;
        case League.LA_LIGA:
            return `/logos/Countries/spain.svg`;
        case League.SERIE_A:
            return `/logos/Countries/italy.svg`;
        case League.J1_LEAGUE:
            return `/logos/Countries/japan.svg`;
        case League.IPL:
            return `/logos/Countries/india.svg`;
        case League.EREDIVISIE:
            return `/logos/Countries/netherlands.svg`;
        case League.PRIMEIRA_LIGA:
            return `/logos/Countries/portugal.svg`;
        case League.T20_BLAST:
            return `/logos/Countries/united-kingdom.svg`;
        case League.SAUDI_PROFESSIONAL_LEAGUE:
            return `/logos/Countries/saudi-arabia.svg`;
        case League.BRAZIL_1:
            return `/logos/Countries/brazil.svg`;
        case League.LIGA_MX:
            return `/logos/Countries/mexico.svg`;
        case League.UEFA_CL:
            return `/logos/Countries/europe.svg`;
        case League.UEFA_EL:
            return `/logos/Countries/europe.svg`;
        case League.UEFA_EURO:
            return `/logos/Countries/europe.svg`;
        case League.UEFA_EURO_U21:
            return `/logos/Countries/europe.svg`;
        case League.UEFA_NATIONS_LEAGUE:
            return `/logos/Countries/europe.svg`;
        case League.UEFA_CONFERENCE_LEAGUE:
            return `/logos/Countries/europe.svg`;
        case League.EUROLEAGUE:
            return `/logos/Countries/europe.svg`;
        case League.ENGLAND_CUP:
            return `/logos/Countries/england.svg`;
        case League.FRANCE_CUP:
            return `/logos/Countries/france.svg`;
        case League.SPAIN_CUP:
            return `/logos/Countries/spain.svg`;
        case League.GERMANY_CUP:
            return `/logos/Countries/germany.svg`;
        case League.ITALY_CUP:
            return `/logos/Countries/italy.svg`;
        default:
            return `/logos/Countries/world.svg`;
    }
};
