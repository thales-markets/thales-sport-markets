import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { MarketStatus } from 'enums/markets';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { UseQueryOptions, useQuery } from 'react-query';
import { SportMarket } from 'types/markets';
import { packMarket } from 'utils/marketsV2';

const useSportMarketQuery = (
    marketAddress: string,
    onlyOpenChildMarkets: boolean,
    isLive: boolean,
    networkId: Network,
    options?: UseQueryOptions<SportMarket | undefined>
) => {
    return useQuery<SportMarket | undefined>(
        QUERY_KEYS.SportMarketV2(marketAddress, networkId, isLive),
        async () => {
            const enableOnlyOpenChildMarkets = onlyOpenChildMarkets && !isLive;
            try {
                const [marketResponse, gameInfoResponse, liveScoreResponse] = await Promise.all([
                    axios.get(
                        `${generalConfig.API_URL}/overtime-v2/networks/${networkId}/${
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
                    ...packMarket(market, gameInfo, liveScore, isLive, 0),
                    childMarkets: orderBy(
                        market.childMarkets
                            .filter(
                                (childMarket: any) =>
                                    (enableOnlyOpenChildMarkets && childMarket.status === MarketStatus.OPEN) ||
                                    !enableOnlyOpenChildMarkets
                            )
                            .map((childMarket: any) => packMarket(childMarket, gameInfo, liveScore, isLive, 0, market)),
                        ['typeId'],
                        ['asc']
                    ),
                };
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            refetchInterval: secondsToMilliseconds(isLive ? 2 : 10),
            ...options,
        }
    );
};

export default useSportMarketQuery;
