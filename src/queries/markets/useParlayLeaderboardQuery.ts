import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { UseQueryOptions, useQuery } from 'react-query';
// import { ParlayMarketWithRank } from 'types/markets';

export const useParlayLeaderboardQuery = (networkId: Network, period: number, options?: UseQueryOptions<any[]>) => {
    return useQuery<any[]>(
        QUERY_KEYS.ParlayLeaderboard(networkId, period),
        async () => {
            try {
                // TODO: hardcode OP for OP Sepolia
                const response = await axios.get(
                    `${generalConfig.API_URL}/parlay-leaderboard/${
                        networkId === Network.OptimismSepolia ? Network.OptimismMainnet : networkId
                    }/${period}`
                );
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
