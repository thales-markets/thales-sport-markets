import { TAGS_LIST } from '../constants/tags';
import { fixOneSideMarketCompetitorName } from './formatters/string';

export const getTeamImageSource = (team: string, leagueTag: number) =>
    leagueTag == 9005 ||
    leagueTag == 9010 ||
    leagueTag == 9012 ||
    leagueTag == 9015 ||
    leagueTag == 9014 ||
    leagueTag == 9007 ||
    leagueTag == 9016 ||
    leagueTag == 9100 ||
    leagueTag == 9001 ||
    leagueTag == 9017 ||
    leagueTag == 9018 ||
    leagueTag == 18977 ||
    leagueTag == 18983 ||
    leagueTag == 19138 ||
    leagueTag == 9020 ||
    leagueTag == 9399 ||
    leagueTag == 18196 ||
    leagueTag == 9057 ||
    leagueTag == 9061 ||
    leagueTag == 9045 ||
    leagueTag == 9296 ||
    leagueTag == 9021 ||
    leagueTag == 9050 ||
    leagueTag == 18806 ||
    leagueTag == 18821 ||
    leagueTag == 9288 ||
    leagueTag == 9042 ||
    leagueTag == 9076 ||
    leagueTag == 19216 ||
    leagueTag == 9073 ||
    leagueTag == 9409
        ? `/logos/${TAGS_LIST.find((t) => t.id == leagueTag)?.label}/${team
              .trim()
              .replaceAll(' ', '-')
              .toLowerCase()}.png`
        : leagueTag == 9153 || leagueTag == 9156
        ? `/logos/Tennis/${team.trim().replaceAll(' ', '-').toLowerCase()}.png`
        : leagueTag == 9445 || leagueTag == 9497
        ? `/logos/${TAGS_LIST.find((t) => t.id == leagueTag)?.label}/${fixOneSideMarketCompetitorName(team)
              .replaceAll(' ', '-')
              .toLowerCase()}.png`
        : leagueTag == 109021
        ? `/logos/PGA/${team.trim().replaceAll(' ', '-').toLowerCase()}.png`
        : leagueTag == 109121
        ? `/logos/PGA/${fixOneSideMarketCompetitorName(team).replaceAll(' ', '-').toLowerCase()}.png`
        : `/logos/${TAGS_LIST.find((t) => t.id == leagueTag)?.label}/${team
              .trim()
              .replaceAll(' ', '-')
              .toLowerCase()}.svg`;

const OVERTIME_LOGO = '/logos/overtime-logo.png';
const OVERTIME_LOGO_DARK = '/logos/overtime-logo-dark.svg';

export const getOnImageError = (setSrc: (src: string) => void, leagueTag: number | string, isDark = false) => () => {
    setSrc(TAGS_LIST.find((t) => t.id === Number(leagueTag))?.logo || (isDark ? OVERTIME_LOGO_DARK : OVERTIME_LOGO));
};

export const getErrorImage = (leagueTag: number | string) => {
    return TAGS_LIST.find((t) => t.id === Number(leagueTag))?.logo || OVERTIME_LOGO;
};

export const getLeagueLogoClass = (leagueTag: number) => {
    return TAGS_LIST.find((t) => t.id === Number(leagueTag))?.logoClass || 'league league--overtime';
};
