import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery } from 'react-query';

const useMarketDurationQuery = (networkId: Network) => {
    return useQuery(QUERY_KEYS.MarketDuration(networkId), async () => {
        // const sportMarketManagerContract = networkConnector.sportMarketManagerContract;

        // const expiryDuration = await sportMarketManagerContract?.expiryDuration();

        // return expiryDuration / (60 * 60 * 24);

        return 90;
    });
};

export default useMarketDurationQuery;
