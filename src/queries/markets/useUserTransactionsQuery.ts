import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { MarketTransaction, MarketTransactions } from 'types/markets';
import { NetworkId } from 'types/network';
import { Position } from 'constants/options';
import { SPORTS_TAGS_MAP, ENETPULSE_SPORTS, GOLF_TOURNAMENT_WINNER_TAG, JSON_ODDS_SPORTS } from 'constants/tags';

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

                return marketTransactions.map((tx: MarketTransaction) => {
                    const isOneSideMarket =
                        (SPORTS_TAGS_MAP['Motosport'].includes(Number(tx.wholeMarket.tags[0])) &&
                            ENETPULSE_SPORTS.includes(Number(tx.wholeMarket.tags[0]))) ||
                        (Number(tx.wholeMarket.tags[0]) == GOLF_TOURNAMENT_WINNER_TAG &&
                            JSON_ODDS_SPORTS.includes(Number(tx.wholeMarket.tags[0])));
                    tx.wholeMarket.isOneSideMarket = isOneSideMarket;
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
