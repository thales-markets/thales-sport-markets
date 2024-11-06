import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { LiveTradingProcessorData } from 'types/markets';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/networkConnector';

const useLiveTradingProcessorDataQuery = (
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LiveTradingProcessorData | undefined>({
        queryKey: QUERY_KEYS.LiveTradingProcessorData(queryConfig.networkId),
        queryFn: async () => {
            const data: LiveTradingProcessorData = {
                maxAllowedExecutionDelay: 10,
            };

            const liveTradingProcessorContract = (await getContractInstance(
                ContractType.LIVE_TRADING_PROCESSOR,
                queryConfig.client,
                queryConfig.networkId
            )) as ViemContract;

            if (liveTradingProcessorContract) {
                const maxAllowedExecutionDelay = await liveTradingProcessorContract.read.maxAllowedExecutionDelay();
                data.maxAllowedExecutionDelay = Number(maxAllowedExecutionDelay);
            }

            return data;
        },
        ...options,
    });
};

export default useLiveTradingProcessorDataQuery;
