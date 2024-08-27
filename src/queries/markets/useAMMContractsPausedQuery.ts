import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import networkConnector from 'utils/networkConnector';

type AMMContractsPausedData = {
    sportsAMM: boolean;
};

const useAMMContractsPausedQuery = (networkId: Network, options?: UseQueryOptions<AMMContractsPausedData>) => {
    return useQuery<AMMContractsPausedData>(
        QUERY_KEYS.CheckPausedAMM(networkId),
        async () => {
            try {
                const { sportsAMMV2Contract } = networkConnector;

                if (sportsAMMV2Contract) {
                    const [isSportsAMMPaused] = await Promise.all([sportsAMMV2Contract.paused()]);

                    return {
                        sportsAMM: isSportsAMMPaused,
                    };
                }

                return {
                    sportsAMM: false,
                };
            } catch (e) {
                console.log(e);
                return {
                    sportsAMM: false,
                };
            }
        },
        {
            ...options,
        }
    );
};

export default useAMMContractsPausedQuery;
