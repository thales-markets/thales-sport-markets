import axios from 'axios';
import { generalConfig } from 'config/general';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';

type User = {
    id: string;
    pnl: number;
    volume: number;
    trades: number;
};

const useUsersStatsQuery = (walletAddress: string, networkId: Network, options?: UseQueryOptions<User[]>) => {
    return useQuery<User[]>(
        QUERY_KEYS.Wallet.Stats(networkId, walletAddress),
        async () => {
            const response = await axios.get(
                `${generalConfig.API_URL}/${API_ROUTES.UserStats}/${networkId}?address=${walletAddress}`
            );
            const users = response?.data ? response.data : [];
            return users;
        },
        {
            ...options,
        }
    );
};

export default useUsersStatsQuery;
