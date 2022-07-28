import { TAGS_LIST } from '../constants/tags';

export const getTeamImageSource = (team: string, leagueTag: number) =>
    leagueTag == 9010 || leagueTag == 9012 || leagueTag == 9015
        ? `/logos/${TAGS_LIST.find((t) => t.id == leagueTag)?.label}/${team
              .trim()
              .replaceAll(' ', '-')
              .toLowerCase()}.png`
        : `/logos/${TAGS_LIST.find((t) => t.id == leagueTag)?.label}/${team
              .trim()
              .replaceAll(' ', '-')
              .toLowerCase()}.svg`;

export const OVERTIME_LOGO = '/logos/overtime-logo.png';
