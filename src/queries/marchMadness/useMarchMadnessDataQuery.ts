import { NUMBER_OF_MATCHES, NUMBER_OF_ROUNDS } from 'constants/marchMadness';
import QUERY_KEYS from 'constants/queryKeys';
import { hoursToMilliseconds, millisecondsToHours, millisecondsToMinutes, secondsToMilliseconds } from 'date-fns';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId } from 'thales-utils';
import networkConnector from 'utils/networkConnector';

type MarchMadnessData = {
    isMintAvailable: boolean;
    minutesLeftToMint: number;
    bracketsIds: number[];
    winnerTeamIdsPerMatch: number[];
    winningsPerRound: number[];
};

const useMarchMadnessDataQuery = (walletAddress: string, networkId: NetworkId, options?: UseQueryOptions<any>) => {
    return useQuery<MarchMadnessData>(
        QUERY_KEYS.MarchMadness.Data(walletAddress, networkId),
        async () => {
            const marchMadnessData: MarchMadnessData = {
                isMintAvailable: false,
                minutesLeftToMint: 0,
                bracketsIds: [],
                winnerTeamIdsPerMatch: Array<number>(NUMBER_OF_MATCHES).fill(0),
                winningsPerRound: Array<number>(NUMBER_OF_ROUNDS).fill(0),
            };

            try {
                const { marchMadnessContract } = networkConnector;

                if (marchMadnessContract && walletAddress !== '') {
                    const TESTING = false; // TODO: remove
                    const tokenIds = TESTING ? [] : await marchMadnessContract.getAddressToTokenIds(walletAddress);

                    const [canNotMintOrUpdateAfter, results, correctPositionsByRound] = await Promise.all([
                        await marchMadnessContract.canNotMintOrUpdateAfter(), // timestamp in seconds
                        await marchMadnessContract.getResults(),
                        await marchMadnessContract.getCorrectPositionsByRound(walletAddress),
                    ]);

                    if (TESTING) {
                        const now = Date.now() - hoursToMilliseconds(365 * 24);
                        marchMadnessData.isMintAvailable = now < secondsToMilliseconds(Number(canNotMintOrUpdateAfter));
                        marchMadnessData.minutesLeftToMint = Math.floor(
                            millisecondsToMinutes(secondsToMilliseconds(Number(canNotMintOrUpdateAfter)) - now)
                        );
                        marchMadnessData.bracketsIds = [];
                        marchMadnessData.winnerTeamIdsPerMatch = Array<number>(NUMBER_OF_MATCHES).fill(0);
                        marchMadnessData.winningsPerRound = Array<number>(NUMBER_OF_ROUNDS).fill(0);
                    } else {
                        const winnerTeamIdsPerMatch = results.map((value: any) => Number(value));
                        const winningsPerRound = correctPositionsByRound.map((value: any) => Number(value));

                        const now = Date.now();
                        marchMadnessData.isMintAvailable = now < secondsToMilliseconds(Number(canNotMintOrUpdateAfter));
                        marchMadnessData.minutesLeftToMint = Math.floor(
                            millisecondsToHours(secondsToMilliseconds(Number(canNotMintOrUpdateAfter)) - now)
                        );
                        marchMadnessData.bracketsIds = tokenIds;
                        marchMadnessData.winnerTeamIdsPerMatch = winnerTeamIdsPerMatch;
                        marchMadnessData.winningsPerRound = winningsPerRound;
                    }
                }

                return marchMadnessData;
            } catch (e) {
                console.log(e);
                return marchMadnessData;
            }
        },
        options
    );
};

export default useMarchMadnessDataQuery;
