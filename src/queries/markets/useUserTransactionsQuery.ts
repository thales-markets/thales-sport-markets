import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { MarketTransaction, MarketTransactions } from 'types/markets';
import { Network } from 'enums/network';
import { Position } from 'enums/markets';
import { getIsOneSideMarket } from '../../utils/markets';

const useUserTransactionsQuery = (
    walletAddress: string,
    networkId: Network,
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

                return marketTransactions.map((tx: MarketTransaction) => {
                    tx.wholeMarket.isOneSideMarket = getIsOneSideMarket(Number(tx.wholeMarket.tags[0]));
                    return { ...tx, position: Position[tx.position] };
                });
            } catch (e) {
                console.log(e);
                return [];
            }
        },
        {
            ...options,
        }
    );
};

export default useUserTransactionsQuery;
