import QUERY_KEYS from 'constants/queryKeys';
import { useQuery } from 'react-query';
import { NetworkId } from 'types/network';
import networkConnector from 'utils/networkConnector';

const useMarketDurationQuery = (networkId: NetworkId) => {
    return useQuery(QUERY_KEYS.MarketDuration(networkId), async () => {
        const sportMarketManagerContract = networkConnector.sportMarketManagerContract;

        const expiryDuration = await sportMarketManagerContract?.expiryDuration();

        return expiryDuration / (60 * 60 * 24);
    });
};

export default useMarketDurationQuery;
