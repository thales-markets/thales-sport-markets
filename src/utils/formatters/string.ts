import { TEAM_ABBREVIATIONS_MAP } from 'constants/teamNames';
import { SportMarketInfo } from 'types/markets';

export const truncateAddress = (address: string, first = 5, last = 5) =>
    address ? `${address.slice(0, first)}...${address.slice(-last, address.length)}` : null;

export const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

export const fixDuplicatedTeamName = (name: string) => {
    const middle = Math.floor(name.length / 2);
    const firstHalf = name.substring(0, middle).trim();
    const secondHalf = name.substring(middle, name.length).trim();

    if (firstHalf === secondHalf) {
        return firstHalf;
    }

    const splittedName = name.split(' ');
    const uniqueWordsInName = new Set(splittedName);
    if (uniqueWordsInName.size !== splittedName.length) {
        return Array.from(uniqueWordsInName).join(' ');
    }

    return name;
};

export const fixLongTeamName = (market: SportMarketInfo) => {
    market.homeTeam.toLowerCase() == 'wolverhampton' ? (market.homeTeam = 'Wolves') : '';
    market.awayTeam.toLowerCase() == 'wolverhampton' ? (market.awayTeam = 'Wolves') : '';
    market.homeTeam.toLowerCase() == 'miami (fl) hurricanes' ? (market.homeTeam = 'Miami Hurricanes') : '';
    market.awayTeam.toLowerCase() == 'miami (fl) hurricanes' ? (market.awayTeam = 'Miami Hurricanes') : '';
    market.homeTeam.toLowerCase() == 'borussia monchengladbach' ? (market.homeTeam = "Borussia M'gladbach") : '';
    market.awayTeam.toLowerCase() == 'borussia monchengladbach' ? (market.awayTeam = "Borussia M'gladbach") : '';
    return market;
};

export const mapTeamNamesMobile = (teamName: string, individualCompetition: boolean) => {
    console.log(teamName);
    console.log(individualCompetition);
    if (individualCompetition) {
        const splittedName = teamName.split(' ');
        return splittedName[splittedName.length - 1];
    }
    console.log(TEAM_ABBREVIATIONS_MAP[teamName.toLowerCase()]);
    return TEAM_ABBREVIATIONS_MAP[teamName.toLowerCase()];
};

export const fixLongTeamNameString = (team: string) => {
    team.toLowerCase() == 'wolverhampton' ? (team = 'Wolves') : '';
    team.toLowerCase() == 'borussia monchengladbach' ? (team = "Borussia M'gladbach") : '';
    return team;
};

export const fixApexName = (team: string) =>
    team !== null
        ? team
              .toLowerCase()
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
              .join(' ')
        : '';
