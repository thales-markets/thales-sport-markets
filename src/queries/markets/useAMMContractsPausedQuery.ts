import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';
import sportsAMMV2Contract from 'utils/contracts/sportsAMMV2Contract';

type AMMContractsPausedData = {
    sportsAMM: boolean;
};

const useAMMContractsPausedQuery = (
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<AMMContractsPausedData>({
        queryKey: QUERY_KEYS.CheckPausedAMM(networkConfig.networkId),
        queryFn: async () => {
            try {
                const sportsAMMV2ContractInstance = getContractInstance(
                    ContractType.SPORTS_AMM_V2,
                    networkConfig.client,
                    networkConfig.networkId
                ) as ViemContract;

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
