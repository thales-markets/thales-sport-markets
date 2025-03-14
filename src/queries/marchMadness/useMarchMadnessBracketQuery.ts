import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { NUMBER_OF_MATCHES, NUMBER_OF_ROUNDS } from 'constants/marchMadness';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { NetworkConfig } from 'types/network';
import { getContractInstance } from 'utils/contract';

type MarchMadnessBracketData = {
    bracketsData: number[];
    winningsPerRound: number[];
    totalPoints: number;
};

const useMarchMadnessBracketQuery = (
    bracketId: number,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<MarchMadnessBracketData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<MarchMadnessBracketData>({
        queryKey: QUERY_KEYS.MarchMadness.Bracket(bracketId, networkConfig.networkId),
        queryFn: async () => {
            const marchMadnessBracketData: MarchMadnessBracketData = {
                bracketsData: Array<number>(NUMBER_OF_MATCHES).fill(0),
                winningsPerRound: Array<number>(NUMBER_OF_ROUNDS).fill(0),
                totalPoints: 0,
            };

            try {
                const marchMadnessContract = getContractInstance(ContractType.MARCH_MADNESS, {
                    client: networkConfig.client,
                    networkId: networkConfig.networkId,
                });

                if (marchMadnessContract) {
                    const [brackets, correctPositionsByRound, totalPoints] = await Promise.all([
                        marchMadnessContract.read.getBracketsByItemId([bracketId]),
                        marchMadnessContract.read.getCorrectPositionsByRound([bracketId]),
                        marchMadnessContract.read.getTotalPointsByTokenId([bracketId]),
                    ]);

                    marchMadnessBracketData.bracketsData = brackets.map((bracket: bigint) => Number(bracket));
                    marchMadnessBracketData.winningsPerRound = correctPositionsByRound.map((value: bigint) =>
                        Number(value)
                    );
                    marchMadnessBracketData.totalPoints = totalPoints;
                }

                return marchMadnessBracketData;
            } catch (e) {
                console.log(e);
                return marchMadnessBracketData;
            }
        },
        ...options,
    });
};

export default useMarchMadnessBracketQuery;
