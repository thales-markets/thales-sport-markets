import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { addHours, millisecondsToSeconds, secondsToMilliseconds, subDays } from 'date-fns';
import { SportFilter, StatusFilter } from 'enums/markets';
import { orderBy } from 'lodash';
import { League, LeagueMap, Sport } from 'overtime-utils';
import { MarketsCache, TicketPosition } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { getProtectedApiRoute } from 'utils/api';
import { packMarket } from 'utils/marketsV2';

export const marketsCache: MarketsCache = {
    [StatusFilter.OPEN_MARKETS]: [],
    [StatusFilter.ONGOING_MARKETS]: [],
    [StatusFilter.RESOLVED_MARKETS]: [],
    [StatusFilter.PAUSED_MARKETS]: [],
    [StatusFilter.CANCELLED_MARKETS]: [],
};

type SportsMarketsFilterProps = {
    includeProofs: boolean;
    status: StatusFilter;
    sport?: SportFilter;
    leaguedIds?: League[];
    gameIds?: string[];
    ticket?: TicketPosition[];
    timeLimitHours?: number;
};

const useSportsMarketsV2Query = (
    filters: SportsMarketsFilterProps,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    const {
        status: statusFilter,
        includeProofs,
        sport: sportFilter,
        leaguedIds: leaguedIdsFilter,
        gameIds: gameIdsFilter,
        ticket,
        timeLimitHours,
    } = filters;

    const leaguedIds = leaguedIdsFilter?.map((leagueId) => leagueId).join(',') || '';
    const gameIds = ticket?.map((market) => market.gameId).join(',') || gameIdsFilter?.join(',') || '';
    const typeIds = ticket?.map((market) => market.typeId).join(',') || '';
    const playerIds = ticket?.map((market) => market.playerId).join(',') || '';
    const lines = ticket?.map((market) => market.line).join(',') || '';

    return useQuery<MarketsCache>({
        queryKey: QUERY_KEYS.SportMarketsV2(
            statusFilter,
            networkConfig.networkId,
            includeProofs,
            sportFilter || '',
            leaguedIds,
            gameIds,
            typeIds,
            playerIds,
            lines,
            timeLimitHours?.toString() || ''
        ),
        queryFn: async () => {
            try {
                const status = statusFilter.toLowerCase().split('market')[0];
                const sport = sportFilter
                    ? Object.values(Sport).find((value: string) => value.toLowerCase() === sportFilter.toLowerCase()) ||
                      ''
                    : '';

                // API takes timestamp argument in seconds
                // show history for 7 days in the past
                const today = new Date();
                const minMaturity = !ticket ? millisecondsToSeconds(subDays(today, 7).getTime()) : '';
                // show all markets for next hours
                const maxMaturity = timeLimitHours
                    ? millisecondsToSeconds(addHours(today, timeLimitHours).getTime())
                    : '';

                const fetchLiveScore = statusFilter === StatusFilter.ONGOING_MARKETS;
                const fetchGameInfo =
                    statusFilter === StatusFilter.ONGOING_MARKETS || statusFilter === StatusFilter.RESOLVED_MARKETS;

                const [marketsResponse, gamesInfoResponse, liveScoresResponse] = await Promise.all([
                    axios.get(
                        getProtectedApiRoute(
                            networkConfig.networkId,
                            'markets',
                            'ungroup=true&onlyBasicProperties=true' +
                                `&status=${status}` +
                                `&includeProofs=${includeProofs}` +
                                `${sport ? `&sport=${sport}` : ''}` +
                                `${sport ? '&includeFuturesInSport=true' : ''}` +
                                `${minMaturity ? `&minMaturity=${minMaturity}` : ''}` +
                                `${maxMaturity ? `&maxMaturity=${maxMaturity}` : ''}` +
                                `${leaguedIds ? `&leagueIds=${leaguedIds}` : ''}` +
                                `${gameIds ? `&gameIds=${gameIds}` : ''}` +
                                `${ticket ? `&typeIds=${typeIds}` : ''}` +
                                `${ticket ? `&playerIds=${playerIds}` : ''}` +
                                `${ticket ? `&lines=${lines}` : ''}`
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

                        return {
                            ...packMarket(market, gameInfo, liveScore, false),
                            childMarkets: orderBy(
                                market.childMarkets
                                    .filter((childMarket: any) => market.status === childMarket.status)
                                    .map((childMarket: any) =>
                                        packMarket(childMarket, gameInfo, liveScore, false, market)
                                    ),
                                ['typeId'],
                                ['asc']
                            ),
                        };
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
