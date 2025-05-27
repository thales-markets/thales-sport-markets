import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { StatusFilter } from 'enums/markets';
import { orderBy } from 'lodash';
import { League, LeagueMap } from 'overtime-utils';
import { MarketsCache, TicketPosition } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { getProtectedApiRoute } from 'utils/api';
import { packMarket } from 'utils/marketsV2';

const marketsCache: MarketsCache = {
    [StatusFilter.OPEN_MARKETS]: [],
    [StatusFilter.ONGOING_MARKETS]: [],
    [StatusFilter.RESOLVED_MARKETS]: [],
    [StatusFilter.PAUSED_MARKETS]: [],
    [StatusFilter.CANCELLED_MARKETS]: [],
};

const useSportsMarketsV2Query = (
    statusFilter: StatusFilter,
    includeProofs: boolean,
    networkConfig: NetworkConfig,
    ticket?: TicketPosition[],
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    const gameIds = ticket?.map((market) => market.gameId).join(',') || '';
    const typeIds = ticket?.map((market) => market.typeId).join(',') || '';
    const playerIds = ticket?.map((market) => market.playerId).join(',') || '';
    const lines = ticket?.map((market) => market.line).join(',') || '';

    return useQuery<MarketsCache>({
        queryKey: QUERY_KEYS.SportMarketsV2(
            statusFilter,
            networkConfig.networkId,
            includeProofs,
            gameIds,
            typeIds,
            playerIds,
            lines
        ),
        queryFn: async () => {
            try {
                const status = statusFilter.toLowerCase().split('market')[0];
                const today = new Date();
                // API takes timestamp argument in seconds
                const minMaturity = Math.round(new Date(new Date().setDate(today.getDate() - 7)).getTime() / 1000); // show history for 7 days in the past

                const fetchLiveScore = statusFilter === StatusFilter.ONGOING_MARKETS;
                const fetchGameInfo =
                    statusFilter === StatusFilter.ONGOING_MARKETS || statusFilter === StatusFilter.RESOLVED_MARKETS;
                const [marketsResponse, gamesInfoResponse, liveScoresResponse] = await Promise.all([
                    axios.get(
                        getProtectedApiRoute(
                            networkConfig.networkId,
                            'markets',
                            `status=${status}&ungroup=true&onlyBasicProperties=true&includeProofs=${includeProofs}${
                                ticket ? '' : `&minMaturity=${minMaturity}`
                            }${ticket ? `&gameIds=${gameIds}` : ''}${ticket ? `&typeIds=${typeIds}` : ''}${
                                ticket ? `&playerIds=${playerIds}` : ''
                            }${ticket ? `&lines=${lines}` : ''}`
                        ),
                        noCacheConfig
                    ),
                    fetchGameInfo
                        ? axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig)
                        : undefined,
                    fetchLiveScore
                        ? axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig)
                        : undefined,
                ]);
                const markets = marketsResponse.data;
                const gamesInfo = gamesInfoResponse?.data;
                const liveScores = liveScoresResponse?.data;

                const mappedMarkets = markets
                    .filter((market: any) => !LeagueMap[market.leagueId as League]?.hidden)
                    .map((market: any) => {
                        const gameInfo = gamesInfo ? gamesInfo[market.gameId] : undefined;
                        const liveScore = liveScores ? liveScores[market.gameId] : undefined;
                        const marketFinal = packMarket(market, gameInfo, liveScore, false);

                        marketFinal.childMarkets = orderBy(
                            market.childMarkets
                                .filter((childMarket: any) => market.status === childMarket.status)
                                .map((childMarket: any) => packMarket(childMarket, gameInfo, liveScore, false, market)),
                            ['typeId'],
                            ['asc']
                        );

                        return marketFinal;
                    });

                marketsCache[statusFilter] = mappedMarkets;

                return { ...marketsCache, [statusFilter]: mappedMarkets };
            } catch (e) {
                console.log(e);
            }
            return marketsCache;
        },
        refetchInterval: secondsToMilliseconds(statusFilter === StatusFilter.OPEN_MARKETS ? 5 : 60),
        ...options,
    });
};

export default useSportsMarketsV2Query;
