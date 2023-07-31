import QUERY_KEYS from 'constants/queryKeys';
import { useQuery } from 'react-query';
import { Network } from 'enums/network';
import networkConnector from 'utils/networkConnector';

const useMarketDurationQuery = (networkId: Network) => {
    return useQuery(QUERY_KEYS.MarketDuration(networkId), async () => {
        const sportMarketManagerContract = networkConnector.sportMarketManagerContract;

        const expiryDuration = await sportMarketManagerContract?.expiryDuration();

        return expiryDuration / (60 * 60 * 24);
    });
};

export default useMarketDurationQuery;
