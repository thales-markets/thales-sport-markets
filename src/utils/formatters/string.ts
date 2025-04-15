import bytes32 from 'bytes32';

export const fixOneSideMarketCompetitorName = (team: string) => {
    return team.endsWith('YES') ? (team !== null ? team.slice(0, team.length - 4).trim() : '') : team;
};

export const convertFromBytes32 = (value: string) => {
    const result = bytes32({ input: value });
    return result.replace(/\0/g, '');
};

export const getCaseAccentInsensitiveString = (value: string) => {
    return value
        .normalize('NFD') // Normalize accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .toLowerCase(); // Case-insensitive
};
