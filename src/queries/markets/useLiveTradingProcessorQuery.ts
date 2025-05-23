import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { LiveTradingProcessor } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';

const useLiveTradingProcessorQuery = (
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LiveTradingProcessor | null>({
        queryKey: QUERY_KEYS.LiveTradingProcessor(networkConfig.networkId),
        queryFn: async () => {
            const data: LiveTradingProcessor = {
                maxAllowedExecutionDelay: 10,
            };

            const liveTradingProcessorContract = getContractInstance(
                ContractType.LIVE_TRADING_PROCESSOR,
                networkConfig
            ) as ViemContract;

            if (liveTradingProcessorContract) {
                const maxAllowedExecutionDelay = await liveTradingProcessorContract.read.maxAllowedExecutionDelay();
                data.maxAllowedExecutionDelay = Number(maxAllowedExecutionDelay);
            }

            return data;
        },
        ...options,
    });
};

export default useLiveTradingProcessorQuery;
