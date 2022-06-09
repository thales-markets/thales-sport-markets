import { TAGS_LIST } from '../constants/tags';

export const getTeamImageSource = (team: string, leagueTag: number) =>
    `/logos/${TAGS_LIST.find((t) => t.id == leagueTag)?.label}/${team.trim().replaceAll(' ', '-').toLowerCase()}.png`;
