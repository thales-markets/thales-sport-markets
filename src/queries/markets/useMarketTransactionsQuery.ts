import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { MarketTransactions, MarketTransaction } from 'types/markets';
import { NetworkId } from 'types/network';
import networkConnector from 'utils/networkConnector';

const useMarketTransactionsQuery = (
    marketAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<MarketTransactions | undefined>
) => {
    return useQuery<MarketTransactions | undefined>(
        QUERY_KEYS.MarketTransactions(marketAddress, networkId),
        async () => {
            try {
                const { marketDataContract } = networkConnector;

                const [marketTransactions, marketData] = await Promise.all([
                    thalesData.exoticMarkets.marketTransactions({
                        market: marketAddress,
                        network: networkId,
                    }),
                    marketDataContract?.getAllMarketData(marketAddress),
                ]);

                const marketPositions = marketData[10];

                const mappedMarketTransactions = marketTransactions.map((tx: MarketTransaction) => {
                    tx.position = marketPositions[Number(tx.position) - 1];
                    return tx;
                });

                return mappedMarketTransactions;
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            refetchInterval: 5000,
            ...options,
        }
    );
};

export default useMarketTransactionsQuery;
