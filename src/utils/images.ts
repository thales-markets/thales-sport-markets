import { TAGS_LIST } from '../constants/tags';
import { fixOneSideMarketCompetitorName } from './formatters/string';

export const getTeamImageSource = (team: string, leagueTag: number) =>
    leagueTag == 9153 || leagueTag == 9156
        ? `/logos/Tennis/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : leagueTag == 9445 || leagueTag == 9497
        ? `/logos/${TAGS_LIST.find((t) => t.id == leagueTag)?.label}/${fixOneSideMarketCompetitorName(team)
              .replaceAll(' ', '-')
              .toLowerCase()}.webp`
        : leagueTag == 109021
        ? `/logos/PGA/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
        : leagueTag == 109121
        ? `/logos/PGA/${fixOneSideMarketCompetitorName(team).replaceAll(' ', '-').toLowerCase()}.webp`
        : leagueTag == 9268
        ? `/logos/Brazil-Serie-A/${team.trim().replaceAll(' ', '-').toLowerCase()}.webp`
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
