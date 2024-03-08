import QUERY_KEYS from 'constants/queryKeys';
import { BigNumber } from 'ethers';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId } from 'thales-utils';
import networkConnector from 'utils/networkConnector';

const useMarchMadnessBracketQuery = (tokenId: number, networkId: NetworkId, options?: UseQueryOptions<any>) => {
    return useQuery<number[]>(
        QUERY_KEYS.MarchMadness.Bracket(tokenId, networkId),
        async () => {
            let bracketsData: number[] = [];

            try {
                const { marchMadnessDataContract } = networkConnector;

                if (marchMadnessDataContract) {
                    const brackets: BigNumber[] = await marchMadnessDataContract.getBracketsByItemId(tokenId);
                    bracketsData = brackets.map((bracket) => Number(bracket));
                }

                return bracketsData;
            } catch (e) {
                console.log(e);
                return bracketsData;
            }
        },
        options
    );
};

export default useMarchMadnessBracketQuery;
