import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { NetworkId } from 'types/network';
import thalesData from 'thales-data';

type User = {
    id: string;
    pnl: number;
    volume: number;
    trades: number;
};

const useUsersStatsQuery = (walletAddress: string, networkId: NetworkId, options?: UseQueryOptions<User[]>) => {
    return useQuery<User[]>(
        QUERY_KEYS.Wallet.Stats(networkId, walletAddress),
        async () => {
            const users = await thalesData.sportMarkets.usersStats({ network: networkId, address: walletAddress });
            return users;
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useUsersStatsQuery;
