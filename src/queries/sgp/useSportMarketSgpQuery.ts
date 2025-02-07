import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { orderBy } from 'lodash';
import { SportMarket, TicketPosition } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { packMarket } from 'utils/marketsV2';

const useSportMarketSgpQuery = (
    ticketPosition: TicketPosition,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<SportMarket | null>({
        queryKey: QUERY_KEYS.SportMarketSgp(
            networkConfig.networkId,
            ticketPosition?.gameId,
            `${ticketPosition?.position},${ticketPosition?.typeId},${ticketPosition?.line},${ticketPosition?.playerId}`
        ),
        queryFn: async () => {
            let mappedMarket = null;

            const marketAddress = ticketPosition?.gameId;
            const position = ticketPosition?.position;
            const typeId = ticketPosition?.typeId;
            const line = ticketPosition?.line;
            const playerId = ticketPosition?.playerId;

            try {
                const marketResponse = await axios.get(
                    `${generalConfig.API_URL}/overtime-v2/networks/${networkConfig.networkId}/sgp/markets/${marketAddress}?position=${position}&typeId=${typeId}&line=${line}&playerId=${playerId}`,
                    noCacheConfig
                );

                const market = marketResponse.data;

                mappedMarket = {
                    ...packMarket(market, undefined, undefined, false),
                    sgpSportsbooks: orderBy(market.sgpSportsbooks),
                    childMarkets: orderBy(
                        market.childMarkets
                            .filter((childMarket: any) => market.status === childMarket.status)
                            .map((childMarket: any) => ({
                                ...packMarket(childMarket, undefined, undefined, false, market),
                                sgpSportsbooks: orderBy(childMarket.sgpSportsbooks),
                            })),
                        ['typeId'],
                        ['asc']
                    ),
                };
            } catch (e: any) {
                console.error(e);
            }

            return mappedMarket;
        },
        ...options,
    });
};

export default useSportMarketSgpQuery;
