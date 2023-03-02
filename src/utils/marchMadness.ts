import { initialBracketsData, NUMBER_OF_TEAMS } from 'constants/marchMadness';
import { NetworkId } from 'types/network';
import { NetworkIdByName } from './network';

export const isMatchInRegion = (matchId: number, region: string) => {
    return (
        initialBracketsData.find(
            (match) => match.id === matchId && match.region.toLowerCase().includes(region.toLowerCase())
        ) !== undefined
    );
};

// rounds index starts from 0
export const getNumberOfMatchesPerRound = (round: number) => {
    return NUMBER_OF_TEAMS / Math.pow(2, round + 1);
};

export const getFirstMatchIndexInRound = (round: number) => {
    return NUMBER_OF_TEAMS - NUMBER_OF_TEAMS / Math.pow(2, round);
};

export const isMarchMadnessAvailableForNetworkId = (networkId: NetworkId) => {
    return [NetworkIdByName.OptimismMainnet, NetworkIdByName.ArbitrumOne, NetworkIdByName.OptimismGoerli].includes(
        networkId
    );
};
