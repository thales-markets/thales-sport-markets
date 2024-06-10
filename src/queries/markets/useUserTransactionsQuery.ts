import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Position } from 'enums/markets';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { MarketTransaction, MarketTransactions } from 'types/markets';
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
                const marketTransactionsRequest = await axios.get(
                    `${generalConfig.API_URL}/${API_ROUTES.Transactions}/${networkId}?account=${walletAddress}`
                );

                const marketTransactions = marketTransactionsRequest?.data ? marketTransactionsRequest.data : [];

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
