import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { NetworkConfig } from 'types/network';
import { AmmSpeedMarketsCreatorParams } from 'types/speedMarkets';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';

const useAmmSpeedMarketsCreatorQuery = (
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<AmmSpeedMarketsCreatorParams>({
        queryKey: QUERY_KEYS.SpeedMarkets.SpeedMarketsCreator(networkConfig.networkId),
        queryFn: async () => {
            const ammSpeedMarketsCreatorParams: AmmSpeedMarketsCreatorParams = { maxCreationDelay: 0 };

            try {
                const speedMarketsCreatorContract = getContractInstance(
                    ContractType.SPEED_MARKETS_AMM_CREATOR,
                    networkConfig
                ) as ViemContract;

                const maxCreationDelay = await speedMarketsCreatorContract.read.maxCreationDelay();

                ammSpeedMarketsCreatorParams.maxCreationDelay = Number(maxCreationDelay);
            } catch (e) {
                console.log(e);
            }

            return ammSpeedMarketsCreatorParams;
        },
        ...options,
    });
};

export default useAmmSpeedMarketsCreatorQuery;
