import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { MarketStatus } from 'enums/markets';
import { orderBy } from 'lodash';
import { SportMarket } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { packMarket } from 'utils/marketsV2';

const useSportMarketQuery = (
    marketAddress: string,
    onlyOpenChildMarkets: boolean,
    isLive: boolean,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<SportMarket | undefined>({
        queryKey: QUERY_KEYS.SportMarketV2(marketAddress, networkConfig.networkId, isLive),
        queryFn: async () => {
            const enableOnlyOpenChildMarkets = onlyOpenChildMarkets && !isLive;
            try {
                const [marketResponse, gameInfoResponse, liveScoreResponse] = await Promise.all([
                    axios.get(
                        `${generalConfig.API_URL}/overtime-v2/networks/${networkConfig.networkId}/${
                            isLive ? 'live-' : ''
                        }markets/${marketAddress}?onlyBasicProperties=true`,
                        noCacheConfig
                    ),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/games-info/${marketAddress}`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores/${marketAddress}`, noCacheConfig),
                ]);

                const market = marketResponse.data;
                const gameInfo = gameInfoResponse.data;
                const liveScore = liveScoreResponse.data;

                return {
                    ...packMarket(market, gameInfo, liveScore, isLive),
                    childMarkets: orderBy(
                        market.childMarkets
                            .filter(
                                (childMarket: any) =>
                                    (enableOnlyOpenChildMarkets && childMarket.status === MarketStatus.OPEN) ||
                                    !enableOnlyOpenChildMarkets
                            )
                            .map((childMarket: any) => packMarket(childMarket, gameInfo, liveScore, isLive, market)),
                        ['typeId'],
                        ['asc']
                    ),
                };
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        refetchInterval: secondsToMilliseconds(isLive ? 2 : 10),
        ...options,
    });
};

export default useSportMarketQuery;
