import bytes32 from 'bytes32';

export const fixOneSideMarketCompetitorName = (team: string) => {
    return team.endsWith('YES') ? (team !== null ? team.slice(0, team.length - 4).trim() : '') : team;
};

export const convertFromBytes32 = (value: string) => {
    const result = bytes32({ input: value });
    return result.replace(/\0/g, '');
};
