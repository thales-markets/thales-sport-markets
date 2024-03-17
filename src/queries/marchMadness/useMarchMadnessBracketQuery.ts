import { NUMBER_OF_MATCHES, NUMBER_OF_ROUNDS } from 'constants/marchMadness';
import QUERY_KEYS from 'constants/queryKeys';
import { BigNumber } from 'ethers';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId } from 'thales-utils';
import networkConnector from 'utils/networkConnector';

type MarchMadnessBracketData = {
    bracketsData: number[];
    winningsPerRound: number[];
    totalPoints: number;
};

const useMarchMadnessBracketQuery = (bracketId: number, networkId: NetworkId, options?: UseQueryOptions<any>) => {
    return useQuery<MarchMadnessBracketData>(
        QUERY_KEYS.MarchMadness.Bracket(bracketId, networkId),
        async () => {
            const marchMadnessBracketData: MarchMadnessBracketData = {
                bracketsData: Array<number>(NUMBER_OF_MATCHES).fill(0),
                winningsPerRound: Array<number>(NUMBER_OF_ROUNDS).fill(0),
                totalPoints: 0,
            };

            try {
                const { marchMadnessContract } = networkConnector;

                if (marchMadnessContract) {
                    const [brackets, correctPositionsByRound, totalPoints] = await Promise.all([
                        marchMadnessContract.getBracketsByItemId(bracketId),
                        marchMadnessContract.getCorrectPositionsByRound(bracketId),
                        marchMadnessContract.getTotalPointsByTokenId(bracketId),
                    ]);

                    marchMadnessBracketData.bracketsData = brackets.map((bracket: BigNumber) => Number(bracket));
                    marchMadnessBracketData.winningsPerRound = correctPositionsByRound.map((value: BigNumber) =>
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
        options
    );
};

export default useMarchMadnessBracketQuery;
