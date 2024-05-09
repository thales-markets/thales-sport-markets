import bytes32 from 'bytes32';

export const fixDuplicatedTeamName = (name: string, isEnetpulseSport: boolean) => {
    if (isEnetpulseSport) return name;
    if (!name?.length) return '';
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

export const fixOneSideMarketCompetitorName = (team: string) => {
    return team.endsWith('YES') ? (team !== null ? team.slice(0, team.length - 4).trim() : '') : team;
};

export const convertFromBytes32 = (value: string) => {
    const result = bytes32({ input: value });
    return result.replace(/\0/g, '');
};
