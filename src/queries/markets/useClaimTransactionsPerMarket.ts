import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { ClaimTransactions } from 'types/markets';
import { NetworkId } from 'types/network';

const useClaimTransactionsPerMarket = (
    marketAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<ClaimTransactions | undefined>
) => {
    return useQuery<ClaimTransactions | undefined>(
        QUERY_KEYS.ClaimTx(marketAddress, networkId),
        async () => {
            try {
                const claimTransactions = await thalesData.sportMarkets.claimTxes({
                    market: marketAddress,
                    network: networkId,
                });

                console.log('claimTransactions ', claimTransactions);

                return claimTransactions;
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

export default useClaimTransactionsPerMarket;
