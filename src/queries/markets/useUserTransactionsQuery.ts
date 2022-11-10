import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { MarketTransaction, MarketTransactions } from 'types/markets';
import { NetworkId } from 'types/network';
import { Position } from 'constants/options';

const useUserTransactionsQuery = (
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<MarketTransactions>
) => {
    return useQuery<MarketTransactions>(
        QUERY_KEYS.UserTransactions(walletAddress, networkId),
        async () => {
            try {
                const marketTransactions = await thalesData.sportMarkets.marketTransactions({
                    account: walletAddress,
                    network: networkId,
                });
                return marketTransactions.map((tx: MarketTransaction) => ({ ...tx, position: Position[tx.position] }));
            } catch (e) {
                console.log(e);
                return [];
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useUserTransactionsQuery;
