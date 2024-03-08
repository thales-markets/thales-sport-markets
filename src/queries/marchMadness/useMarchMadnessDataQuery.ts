import { NUMBER_OF_MATCHES, NUMBER_OF_ROUNDS } from 'constants/marchMadness';
import QUERY_KEYS from 'constants/queryKeys';
import { millisecondsToMinutes, secondsToMilliseconds } from 'date-fns';
import { BigNumber } from 'ethers';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId, coinFormatter } from 'thales-utils';
import networkConnector from 'utils/networkConnector';

type MarchMadnessData = {
    mintingPrice: number;
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
                mintingPrice: 0,
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
                    const tokenIds: BigNumber[] = TESTING
                        ? []
                        : await marchMadnessContract.getAddressToTokenIds(walletAddress);

                    const [mintingPrice, canNotMintOrUpdateAfter, results, correctPositionsByRound] = await Promise.all(
                        [
                            await marchMadnessContract.mintingPrice(),
                            await marchMadnessContract.canNotMintOrUpdateAfter(), // timestamp in seconds
                            await marchMadnessContract.getResults(),
                            await marchMadnessContract.getCorrectPositionsByRound(walletAddress),
                        ]
                    );

                    if (TESTING) {
                        const now = Date.now();
                        const gameStart = 1711037437000;
                        marchMadnessData.mintingPrice = 50;
                        marchMadnessData.isMintAvailable = now < gameStart;
                        marchMadnessData.minutesLeftToMint = millisecondsToMinutes(gameStart - now);
                        marchMadnessData.bracketsIds = [];
                        marchMadnessData.winnerTeamIdsPerMatch = Array<number>(NUMBER_OF_MATCHES).fill(0);
                        marchMadnessData.winningsPerRound = Array<number>(NUMBER_OF_ROUNDS).fill(0);
                    } else {
                        marchMadnessData.mintingPrice = coinFormatter(mintingPrice, networkId);

                        const now = Date.now();
                        marchMadnessData.isMintAvailable = now < secondsToMilliseconds(Number(canNotMintOrUpdateAfter));
                        marchMadnessData.minutesLeftToMint = millisecondsToMinutes(
                            secondsToMilliseconds(Number(canNotMintOrUpdateAfter)) - now
                        );
                        marchMadnessData.bracketsIds = tokenIds.map((tokenId) => Number(tokenId));

                        const winnerTeamIdsPerMatch = results.map((value: any) => Number(value));
                        const winningsPerRound = correctPositionsByRound.map((value: any) => Number(value));

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
