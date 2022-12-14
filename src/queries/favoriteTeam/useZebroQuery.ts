import QUERY_KEYS from 'constants/queryKeys';
import { useQuery } from 'react-query';
import { NetworkId } from 'types/network';
import axios from 'axios';
import { generalConfig } from 'config/general';

export type User = {
    rank: number;
    address: string;
    url: string;
    baseVolume: number;
    volume: number;
    bonusVolume: number;
    rewards: { op: number; thales: number };
};

const useLeaderboardQuery = (networkId: NetworkId) => {
    return useQuery<{ globalVolume: number; leaderboard: [User] }>(QUERY_KEYS.Zebro(networkId), async () => {
        const response = await axios.get(`${generalConfig.API_URL}/fifa-rewards/${networkId}`);
        return response.data;
    });
};

export default useLeaderboardQuery;
