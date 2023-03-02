import { initialBracketsData } from 'constants/marchMadness';

export const isMatchInRegion = (matchId: number, region: string) => {
    return initialBracketsData.find((match) => match.id === matchId && match.region === region) !== undefined;
};
