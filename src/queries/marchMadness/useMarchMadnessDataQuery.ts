import { END_MINTING_DATE, NUMBER_OF_MATCHES } from 'constants/marchMadness';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { BigNumber } from 'ethers';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId, coinFormatter } from 'thales-utils';
import { isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';
import networkConnector from 'utils/networkConnector';

type MarchMadnessData = {
    mintingPrice: number;
    isMintAvailable: boolean;
    mintEndingDate: number;
    bracketsIds: number[];
    winnerTeamIdsPerMatch: number[];
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
            };

            if (isMarchMadnessAvailableForNetworkId(networkId)) {
                try {
                    const { marchMadnessContract } = networkConnector;

                    if (marchMadnessContract) {
                        const now = Date.now();
                        if (walletAddress !== '') {
                            const tokenIds: BigNumber[] = await marchMadnessContract.getAddressToTokenIds(
                                walletAddress
                            );

                            const [mintingPrice, canNotMintOrUpdateAfter, results] = await Promise.all([
                                await marchMadnessContract.mintingPrice(),
                                await marchMadnessContract.canNotMintOrUpdateAfter(), // timestamp in seconds
                                await marchMadnessContract.getResults(),
                            ]);

                            marchMadnessData.mintingPrice = coinFormatter(mintingPrice, networkId);
                            marchMadnessData.mintEndingDate = Number(canNotMintOrUpdateAfter);
                            marchMadnessData.isMintAvailable =
                                now < secondsToMilliseconds(Number(canNotMintOrUpdateAfter));
                            marchMadnessData.bracketsIds = tokenIds.map((tokenId) => Number(tokenId));
                            marchMadnessData.winnerTeamIdsPerMatch = results.map((value: any) => Number(value));
                        } else {
                            const canNotMintOrUpdateAfter = await marchMadnessContract.canNotMintOrUpdateAfter(); // timestamp in seconds
                            marchMadnessData.isMintAvailable =
                                now < secondsToMilliseconds(Number(canNotMintOrUpdateAfter));
                            marchMadnessData.mintEndingDate = Number(canNotMintOrUpdateAfter);
                        }
                    }

                    return marchMadnessData;
                } catch (e) {
                    console.log(e);
                    return marchMadnessData;
                }
            } else {
                const canNotMintOrUpdateAfter = END_MINTING_DATE; // timestamp in seconds
                marchMadnessData.isMintAvailable = Date.now() < secondsToMilliseconds(Number(canNotMintOrUpdateAfter));
                marchMadnessData.mintEndingDate = Number(canNotMintOrUpdateAfter);
                return marchMadnessData;
            }
        },
        options
    );
};

export default useMarchMadnessDataQuery;
