import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { SportMarketInfo } from 'types/markets';
import { NetworkId } from 'types/network';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import networkConnector from 'utils/networkConnector';

const useNormalizedOddsQuery = (
    sportMarket: SportMarketInfo,
    networkId: NetworkId,
    options?: UseQueryOptions<SportMarketInfo>
) => {
    return useQuery<SportMarketInfo>(
        QUERY_KEYS.NormalizedOdds(sportMarket, networkId),
        async () => {
            try {
                const rundownConsumerContract = networkConnector.theRundownConsumerContract;
                if (sportMarket.homeOdds !== 0 && sportMarket.awayOdds !== 0) {
                    const normalizedOdds = await rundownConsumerContract?.getNormalizedOdds(sportMarket.id);
                    sportMarket.homeOdds = bigNumberFormatter(normalizedOdds[0]);
                    sportMarket.awayOdds = bigNumberFormatter(normalizedOdds[1]);
                    sportMarket.drawOdds = bigNumberFormatter(normalizedOdds[2]);
                    return sportMarket;
                }
                return sportMarket;
            } catch (e) {
                return sportMarket;
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useNormalizedOddsQuery;
