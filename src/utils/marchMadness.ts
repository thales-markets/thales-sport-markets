import { initialBracketsData, NUMBER_OF_TEAMS } from 'constants/marchMadness';

export const isMatchInRegion = (matchId: number, region: string) => {
    return initialBracketsData.find((match) => match.id === matchId && match.region === region) !== undefined;
};

// rounds index starts from 0
export const getNumberOfMatchesPerRound = (round: number) => {
    return NUMBER_OF_TEAMS / Math.pow(2, round + 1);
};

export const getFirstMatchIndexInRound = (round: number) => {
    return NUMBER_OF_TEAMS - NUMBER_OF_TEAMS / Math.pow(2, round);
};
