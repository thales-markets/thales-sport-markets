import { useQuery, UseQueryOptions } from 'react-query';
import thalesData from 'thales-data';
import QUERY_KEYS from 'constants/queryKeys';
import { ClaimTransaction, ClaimTransactions } from 'types/markets';
import { NetworkId } from 'types/network';

const useClaimTransactionsPerMarket = (
    marketAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<ClaimTransactions | undefined>
) => {
    const KEEPER_BOT_CALLER_ADDRESS = '0x3292e6583dfa145fc25cfe3a74d8f66846683633';

    return useQuery<ClaimTransactions | undefined>(
        QUERY_KEYS.ClaimTx(marketAddress, networkId),
        async () => {
            try {
                const [claimTransactions, childClaimTransactions] = await Promise.all([
                    thalesData.sportMarkets.claimTxes({
                        market: marketAddress,
                        network: networkId,
                    }),
                    thalesData.sportMarkets.claimTxes({
                        parentMarket: marketAddress,
                        network: networkId,
                    }),
                ]);

                // Filter keeper bot transactions
                const data = [...claimTransactions, ...childClaimTransactions].filter(
                    (tx: ClaimTransaction) => tx?.caller?.toLowerCase() !== KEEPER_BOT_CALLER_ADDRESS
                );

                return data;
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
