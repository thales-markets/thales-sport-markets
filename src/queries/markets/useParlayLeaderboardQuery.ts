import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { ParlayMarketWithRank } from 'types/markets';
import { Network } from 'enums/network';
import { generalConfig } from 'config/general';
import axios from 'axios';

export const useParlayLeaderboardQuery = (
    networkId: Network,
    period: number,
    options?: UseQueryOptions<ParlayMarketWithRank[]>
) => {
    return useQuery<ParlayMarketWithRank[]>(
        QUERY_KEYS.ParlayLeaderboard(networkId, period),
        async () => {
            try {
                const response = await axios.get(`${generalConfig.API_URL}/parlay-leaderboard/${networkId}/${period}`);
                return response.data;
            } catch (e) {
                console.log('error', e);
                return [];
            }
        },
        {
            ...options,
        }
    );
};
