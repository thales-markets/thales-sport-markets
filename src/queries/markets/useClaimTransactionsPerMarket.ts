import axios from 'axios';
import { generalConfig } from 'config/general';
import QUERY_KEYS from 'constants/queryKeys';
import { API_ROUTES } from 'constants/routes';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { ClaimTransaction, ClaimTransactions } from 'types/markets';

const useClaimTransactionsPerMarket = (
    marketAddress: string,
    networkId: Network,
    options?: UseQueryOptions<ClaimTransactions | undefined>
) => {
    const KEEPER_BOT_CALLER_ADDRESS = '0x3292e6583dfa145fc25cfe3a74d8f66846683633';

    return useQuery<ClaimTransactions | undefined>(
        QUERY_KEYS.ClaimTx(marketAddress, networkId),
        async () => {
            try {
                const [claimTransactions, childClaimTransactions] = await Promise.all([
                    axios.get(`${generalConfig.API_URL}/${API_ROUTES.ClaimTxes}/${networkId}?market=${marketAddress}`),
                    axios.get(
                        `${generalConfig.API_URL}/${API_ROUTES.ClaimTxes}/${networkId}?parent-market=${marketAddress}`
                    ),
                ]);

                // Filter keeper bot transactions
                const data = [
                    ...(claimTransactions?.data ? claimTransactions.data : []),
                    ...(childClaimTransactions?.data ? childClaimTransactions.data : []),
                ].filter((tx: ClaimTransaction) => tx?.caller?.toLowerCase() !== KEEPER_BOT_CALLER_ADDRESS);

                return data;
            } catch (e) {
                console.log(e);
                return undefined;
            }
        },
        {
            ...options,
        }
    );
};

export default useClaimTransactionsPerMarket;
