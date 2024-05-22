import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { LiveTradingProcessorData } from 'types/markets';
import networkConnector from 'utils/networkConnector';

const useLiveTradingProcessorDataQuery = (
    networkId: Network,
    options?: UseQueryOptions<LiveTradingProcessorData | undefined>
) => {
    return useQuery<LiveTradingProcessorData | undefined>(
        QUERY_KEYS.LiveTradingProcessorData(networkId),
        async () => {
            const data: LiveTradingProcessorData = {
                maxAllowedExecutionDelay: 10,
            };

            const { liveTradingProcessorContract } = networkConnector;

            if (liveTradingProcessorContract) {
                const maxAllowedExecutionDelay = await liveTradingProcessorContract.maxAllowedExecutionDelay();
                data.maxAllowedExecutionDelay = Number(maxAllowedExecutionDelay);
            }

            return data;
        },
        { ...options }
    );
};

export default useLiveTradingProcessorDataQuery;
