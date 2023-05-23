import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'types/network';
import { SGPContractData, SGPItem } from 'types/markets';
import networkConnector from 'utils/networkConnector';
import { convertSGPContractDataToSGPItemType } from 'utils/combinedMarkets';

const useSGPFeesQuery = (networkId: NetworkId, options?: UseQueryOptions<SGPItem[] | undefined>) => {
    return useQuery<SGPItem[] | undefined>(
        QUERY_KEYS.SGPFees(networkId),
        async () => {
            try {
                const { parlayMarketDataContract } = networkConnector;

                if (parlayMarketDataContract) {
                    const response: SGPContractData = await parlayMarketDataContract?.getAllSGPFees();

                    if (!response) return;

                    const sgpItems = convertSGPContractDataToSGPItemType(response);

                    return sgpItems;
                }

                return undefined;
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            ...options,
        }
    );
};

export default useSGPFeesQuery;
