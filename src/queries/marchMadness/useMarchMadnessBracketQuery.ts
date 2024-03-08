import QUERY_KEYS from 'constants/queryKeys';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId } from 'thales-utils';
import networkConnector from 'utils/networkConnector';

const useMarchMadnessBracketQuery = (tokenId: number, networkId: NetworkId, options?: UseQueryOptions<any>) => {
    return useQuery<number[]>(
        QUERY_KEYS.MarchMadness.Bracket(tokenId, networkId),
        async () => {
            let brackets = [];

            try {
                const { marchMadnessContract } = networkConnector;

                if (marchMadnessContract) {
                    brackets = await marchMadnessContract.itemToBrackets(tokenId);
                }

                return brackets;
            } catch (e) {
                console.log(e);
                return brackets;
            }
        },
        options
    );
};

export default useMarchMadnessBracketQuery;
