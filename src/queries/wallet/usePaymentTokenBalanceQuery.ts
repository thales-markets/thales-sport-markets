import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import { bigNumberFormatter } from 'utils/formatters/ethers';
import { BALANCE_THRESHOLD } from 'constants/wallet';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';

const usePaymentTokenBalanceQuery = (
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<number | undefined>
) => {
    return useQuery<number | undefined>(
        QUERY_KEYS.Wallet.PaymentTokenBalance(walletAddress, networkId),
        async () => {
            try {
                const { paymentTokenContract } = networkConnector;
                if (paymentTokenContract) {
                    const balance = bigNumberFormatter(await paymentTokenContract.balanceOf(walletAddress));
                    return balance < BALANCE_THRESHOLD ? 0 : balance;
                }
                return 0;
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

export default usePaymentTokenBalanceQuery;
