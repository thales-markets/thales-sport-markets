import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { Network } from 'enums/network';
import thalesData from 'thales-data';

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
            const users = await thalesData.sportMarkets.usersStats({ network: networkId, address: walletAddress });
            return users;
        },
        {
            ...options,
        }
    );
};

export default useUsersStatsQuery;
