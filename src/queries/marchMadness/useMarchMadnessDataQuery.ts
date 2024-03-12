import { ENDING_MINTING_DATE, NUMBER_OF_MATCHES, NUMBER_OF_ROUNDS } from 'constants/marchMadness';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { Network } from 'enums/network';
import { BigNumber } from 'ethers';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId, coinFormatter } from 'thales-utils';
import networkConnector from 'utils/networkConnector';

type MarchMadnessData = {
    mintingPrice: number;
    isMintAvailable: boolean;
    mintEndingDate: number;
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
                mintEndingDate: 0,
                bracketsIds: [],
                winnerTeamIdsPerMatch: Array<number>(NUMBER_OF_MATCHES).fill(0),
                winningsPerRound: Array<number>(NUMBER_OF_ROUNDS).fill(0),
            };

            if (networkId === Network.Arbitrum) {
                try {
                    const { marchMadnessContract } = networkConnector;

                    if (marchMadnessContract) {
                        const now = Date.now();
                        if (walletAddress !== '') {
                            const tokenIds: BigNumber[] = await marchMadnessContract.getAddressToTokenIds(
                                walletAddress
                            );

                            const [
                                mintingPrice,
                                canNotMintOrUpdateAfter,
                                results,
                                correctPositionsByRound,
                            ] = await Promise.all([
                                await marchMadnessContract.mintingPrice(),
                                await marchMadnessContract.canNotMintOrUpdateAfter(), // timestamp in seconds
                                await marchMadnessContract.getResults(),
                                await marchMadnessContract.getCorrectPositionsByRound(walletAddress),
                            ]);

                            marchMadnessData.mintingPrice = coinFormatter(mintingPrice, networkId);
                            marchMadnessData.mintEndingDate = Number(canNotMintOrUpdateAfter);

                            marchMadnessData.isMintAvailable =
                                now < secondsToMilliseconds(Number(canNotMintOrUpdateAfter));
                            marchMadnessData.bracketsIds = tokenIds.map((tokenId) => Number(tokenId));

                            const winnerTeamIdsPerMatch = results.map((value: any) => Number(value));
                            const winningsPerRound = correctPositionsByRound.map((value: any) => Number(value));

                            marchMadnessData.winnerTeamIdsPerMatch = winnerTeamIdsPerMatch;
                            marchMadnessData.winningsPerRound = winningsPerRound;
                        } else {
                            const canNotMintOrUpdateAfter = await marchMadnessContract.canNotMintOrUpdateAfter(); // timestamp in seconds
                            marchMadnessData.isMintAvailable =
                                now < secondsToMilliseconds(Number(canNotMintOrUpdateAfter));
                            marchMadnessData.mintEndingDate = Number(canNotMintOrUpdateAfter);
                        }
                    }

                    // TODO: testing data
                    // return {
                    //     mintingPrice: 1,
                    //     isMintAvailable: false,
                    //     mintEndingDate: 1710979200,
                    //     minutesLeftToMint: 0,
                    //     bracketsIds: [1],
                    //     winnerTeamIdsPerMatch: [
                    //         1,
                    //         8,
                    //         5,
                    //         4,
                    //         6,
                    //         3,
                    //         7,
                    //         2,
                    //         17,
                    //         24,
                    //         21,
                    //         20,
                    //         22,
                    //         19,
                    //         23,
                    //         18,
                    //         33,
                    //         40,
                    //         37,
                    //         36,
                    //         38,
                    //         35,
                    //         39,
                    //         34,
                    //         49,
                    //         56,
                    //         53,
                    //         52,
                    //         54,
                    //         51,
                    //         55,
                    //         50,
                    //         1,
                    //         4,
                    //         3,
                    //         2,
                    //         17,
                    //         20,
                    //         19,
                    //         18,
                    //         33,
                    //         36,
                    //         35,
                    //         34,
                    //         49,
                    //         52,
                    //         51,
                    //         50,
                    //         1,
                    //         2,
                    //         17,
                    //         18,
                    //         33,
                    //         34,
                    //         49,
                    //         50,
                    //         1,
                    //         17,
                    //         33,
                    //         49,
                    //         17,
                    //         33,
                    //         17,
                    //     ],
                    //     winningsPerRound: Array<number>(NUMBER_OF_ROUNDS).fill(0),
                    // };

                    return marchMadnessData;
                } catch (e) {
                    console.log(e);
                    return marchMadnessData;
                }
            } else {
                const canNotMintOrUpdateAfter = ENDING_MINTING_DATE; // timestamp in seconds
                marchMadnessData.isMintAvailable = Date.now() < secondsToMilliseconds(Number(canNotMintOrUpdateAfter));
                marchMadnessData.mintEndingDate = Number(canNotMintOrUpdateAfter);
                return marchMadnessData;
            }
        },
        options
    );
};

export default useMarchMadnessDataQuery;
