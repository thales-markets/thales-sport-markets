import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { useQuery, UseQueryOptions } from 'react-query';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import sportsAMMV2Contract from 'utils/contracts/sportsAMMV2Contract';
import { getContractInstance } from 'utils/networkConnector';

type AMMContractsPausedData = {
    sportsAMM: boolean;
};

const useAMMContractsPausedQuery = (
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<AMMContractsPausedData>({
        queryKey: QUERY_KEYS.CheckPausedAMM(queryConfig.networkId),
        queryFn: async () => {
            try {
                const sportsAMMV2ContractInstance = (await getContractInstance(
                    ContractType.SPORTS_AMM_V2,
                    queryConfig.client,
                    queryConfig.networkId
                )) as ViemContract;

                if (sportsAMMV2Contract) {
                    const [isSportsAMMPaused] = await Promise.all([sportsAMMV2ContractInstance.read.paused()]);

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
        ...options,
    });
};

export default useAMMContractsPausedQuery;
