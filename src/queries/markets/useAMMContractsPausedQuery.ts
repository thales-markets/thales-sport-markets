import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import networkConnector from 'utils/networkConnector';

type AMMContractsPausedData = {
    parlayAMM: boolean;
    singleAMM: boolean;
};

const useAMMContractsPausedQuery = (networkId: Network, options?: UseQueryOptions<AMMContractsPausedData>) => {
    return useQuery<AMMContractsPausedData>(
        QUERY_KEYS.CheckPausedAMM(networkId),
        async () => {
            try {
                const { parlayMarketsAMMContract, sportsAMMContract } = networkConnector;

                if (parlayMarketsAMMContract && sportsAMMContract) {
                    const [isSportsAMMPaused, isParlayAMMPaused] = await Promise.all([
                        sportsAMMContract?.paused(),
                        parlayMarketsAMMContract?.paused(),
                    ]);

                    return {
                        parlayAMM: isParlayAMMPaused,
                        singleAMM: isSportsAMMPaused,
                    };
                }

                return {
                    parlayAMM: false,
                    singleAMM: false,
                };
            } catch (e) {
                console.log(e);
                return {
                    parlayAMM: false,
                    singleAMM: false,
                };
            }
        },
        {
            ...options,
        }
    );
};

export default useAMMContractsPausedQuery;
