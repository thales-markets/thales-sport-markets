import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { END_MINTING_DATE, NUMBER_OF_MATCHES } from 'constants/marchMadness';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { coinFormatter } from 'thales-utils';
import { NetworkConfig } from 'types/network';
import { getContractInstance } from 'utils/contract';
import { isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';

type MarchMadnessData = {
    mintingPrice: number;
    isMintAvailable: boolean;
    mintEndingDate: number;
    bracketsIds: number[];
    winnerTeamIdsPerMatch: number[];
};

const useMarchMadnessDataQuery = (
    walletAddress: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<MarchMadnessData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<MarchMadnessData>({
        queryKey: QUERY_KEYS.MarchMadness.Data(walletAddress, networkConfig.networkId),
        queryFn: async () => {
            const marchMadnessData: MarchMadnessData = {
                mintingPrice: 0,
                isMintAvailable: false,
                mintEndingDate: 0,
                bracketsIds: [],
                winnerTeamIdsPerMatch: Array<number>(NUMBER_OF_MATCHES).fill(0),
            };

            if (isMarchMadnessAvailableForNetworkId(networkConfig.networkId)) {
                try {
                    const marchMadnessContract = getContractInstance(ContractType.MARCH_MADNESS, {
                        client: networkConfig.client,
                        networkId: networkConfig.networkId,
                    });

                    if (marchMadnessContract) {
                        const now = Date.now();
                        if (walletAddress !== '') {
                            const tokenIds: bigint[] = await marchMadnessContract.read.getAddressToTokenIds([
                                walletAddress,
                            ]);

                            const [mintingPrice, canNotMintOrUpdateAfter, results] = await Promise.all([
                                await marchMadnessContract.read.mintingPrice(),
                                await marchMadnessContract.read.canNotMintOrUpdateAfter(), // timestamp in seconds
                                await marchMadnessContract.read.getResults(),
                            ]);

                            marchMadnessData.mintingPrice = coinFormatter(mintingPrice, networkConfig.networkId);
                            marchMadnessData.mintEndingDate = Number(canNotMintOrUpdateAfter);
                            marchMadnessData.isMintAvailable =
                                now < secondsToMilliseconds(Number(canNotMintOrUpdateAfter));
                            marchMadnessData.bracketsIds = tokenIds.map((tokenId) => Number(tokenId));
                            marchMadnessData.winnerTeamIdsPerMatch = results.map((value: any) => Number(value));
                        } else {
                            const canNotMintOrUpdateAfter = await marchMadnessContract.read.canNotMintOrUpdateAfter(); // timestamp in seconds
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
        ...options,
    });
};

export default useMarchMadnessDataQuery;
