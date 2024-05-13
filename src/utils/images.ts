import { SupportedLanguages } from 'enums/languages';
import { TAGS_FLAGS } from 'enums/tags';
import { TAGS_LIST } from '../constants/tags';
import { fixOneSideMarketCompetitorName } from './formatters/string';
import { isInternationalGame } from './markets';

export const getTeamImageSource = (team: string, leagueTag: number) =>
    leagueTag == TAGS_FLAGS.TENNIS_GS || leagueTag == TAGS_FLAGS.TENNIS_MASTERS
        ? `/logos/Tennis/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : leagueTag == TAGS_FLAGS.FORMULA1 || leagueTag == TAGS_FLAGS.MOTOGP
        ? `/logos/${TAGS_LIST.find((t) => t.id == leagueTag)?.label}/${fixOneSideMarketCompetitorName(team)
              .replaceAll(' ', '-')
              .toLowerCase()}.webp`
        : leagueTag == TAGS_FLAGS.GOLF_H2H
        ? `/logos/PGA/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : leagueTag == TAGS_FLAGS.GOLF_WINNER
        ? `/logos/PGA/${fixOneSideMarketCompetitorName(team).replaceAll(' ', '-').toLowerCase()}.webp`
        : leagueTag == TAGS_FLAGS.BRAZIL_1
        ? `/logos/Brazil-Serie-A/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : isInternationalGame(Number(leagueTag))
        ? `/logos/Countries/${team.trim().replaceAll(' ', '-').toLowerCase()}.svg`
        : leagueTag == TAGS_FLAGS.ENGLAND_CUP
        ? `/logos/EPL/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : leagueTag == TAGS_FLAGS.FRANCE_CUP
        ? `/logos/Ligue 1/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : leagueTag == TAGS_FLAGS.SPAIN_CUP
        ? `/logos/La Liga/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : leagueTag == TAGS_FLAGS.ITALY_CUP
        ? `/logos/Serie A/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : leagueTag == TAGS_FLAGS.GERMANY_CUP
        ? `/logos/Bundesliga/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : `/logos/${TAGS_LIST.find((t) => t.id == leagueTag)?.label}/${team
              .trim()
              .replaceAll(' ', '-')
              .toLowerCase()}.webp`;

const OVERTIME_LOGO = '/logos/overtime-logo.png';
const OVERTIME_LOGO_DARK = '/logos/overtime-logo-dark.svg';
const PROFILE_SILHOUETTE = '/profile-silhouette.svg';

export const getOnImageError = (setSrc: (src: string) => void, leagueTag: number | string, isDark = false) => () => {
    setSrc(TAGS_LIST.find((t) => t.id === Number(leagueTag))?.logo || (isDark ? OVERTIME_LOGO_DARK : OVERTIME_LOGO));
};

export const getOnPlayerImageError = (setSrc: (src: string) => void) => () => {
    setSrc(PROFILE_SILHOUETTE);
};

export const getErrorImage = (leagueTag: number | string) => {
    return TAGS_LIST.find((t) => t.id === Number(leagueTag))?.logo || OVERTIME_LOGO;
};

export const getLeagueLogoClass = (leagueTag: number) => {
    return TAGS_LIST.find((t) => t.id === Number(leagueTag))?.logoClass || 'league league--overtime';
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
        case TAGS_FLAGS.NCAA_FOOTBALL:
            return `/logos/Countries/united-states-of-america.svg`;
        case TAGS_FLAGS.NFL:
            return `/logos/Countries/united-states-of-america.svg`;
        case TAGS_FLAGS.MLB:
            return `/logos/Countries/united-states-of-america.svg`;
        case TAGS_FLAGS.NBA:
            return `/logos/Countries/united-states-of-america.svg`;
        case TAGS_FLAGS.NCAA_BASKETBALL:
            return `/logos/Countries/united-states-of-america.svg`;
        case TAGS_FLAGS.NHL:
            return `/logos/Countries/united-states-of-america.svg`;
        case TAGS_FLAGS.WNBA:
            return `/logos/Countries/united-states-of-america.svg`;
        case TAGS_FLAGS.MLS:
            return `/logos/Countries/united-states-of-america.svg`;
        case TAGS_FLAGS.EPL:
            return `/logos/Countries/england.svg`;
        case TAGS_FLAGS.LIGUE_ONE:
            return `/logos/Countries/france.svg`;
        case TAGS_FLAGS.BUNDESLIGA:
            return `/logos/Countries/germany.svg`;
        case TAGS_FLAGS.LA_LIGA:
            return `/logos/Countries/spain.svg`;
        case TAGS_FLAGS.SERIE_A:
            return `/logos/Countries/italy.svg`;
        case TAGS_FLAGS.J1_LEAGUE:
            return `/logos/Countries/japan.svg`;
        case TAGS_FLAGS.IPL:
            return `/logos/Countries/india.svg`;
        case TAGS_FLAGS.EREDIVISIE:
            return `/logos/Countries/netherlands.svg`;
        case TAGS_FLAGS.PRIMEIRA_LIGA:
            return `/logos/Countries/portugal.svg`;
        case TAGS_FLAGS.T20_BLAST:
            return `/logos/Countries/united-kingdom.svg`;
        case TAGS_FLAGS.SAUDI_PROFESSIONAL_LEAGUE:
            return `/logos/Countries/saudi-arabia.svg`;
        case TAGS_FLAGS.BRAZIL_1:
            return `/logos/Countries/brazil.svg`;
        case TAGS_FLAGS.UEFA_CL:
            return `/logos/Countries/europe.svg`;
        case TAGS_FLAGS.UEFA_EL:
            return `/logos/Countries/europe.svg`;
        case TAGS_FLAGS.UEFA_EURO_QUALIFICATIONS:
            return `/logos/Countries/europe.svg`;
        case TAGS_FLAGS.UEFA_EURO_U21:
            return `/logos/Countries/europe.svg`;
        case TAGS_FLAGS.UEFA_NATIONS_LEAGUE:
            return `/logos/Countries/europe.svg`;
        case TAGS_FLAGS.UEFA_CONFERENCE_LEAGUE:
            return `/logos/Countries/europe.svg`;
        case TAGS_FLAGS.EUROLEAGUE:
            return `/logos/Countries/europe.svg`;
        case TAGS_FLAGS.ENGLAND_CUP:
            return `/logos/Countries/england.svg`;
        case TAGS_FLAGS.FRANCE_CUP:
            return `/logos/Countries/france.svg`;
        case TAGS_FLAGS.SPAIN_CUP:
            return `/logos/Countries/spain.svg`;
        case TAGS_FLAGS.GERMANY_CUP:
            return `/logos/Countries/germany.svg`;
        case TAGS_FLAGS.ITALY_CUP:
            return `/logos/Countries/italy.svg`;
        default:
            return `/logos/Countries/world.svg`;
    }
};
