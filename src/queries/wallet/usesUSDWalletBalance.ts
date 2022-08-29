import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { STABLE_DECIMALS } from 'constants/currency';

const useSUSDWalletBalance = (
    walletAddress: string,
    networkId: NetworkId,
    options?: UseQueryOptions<number | undefined>
) => {
    return useQuery<number | undefined>(
        QUERY_KEYS.Wallet.GetsUSDWalletBalance(walletAddress, networkId),
        async () => {
            try {
                const { sUSDContract } = networkConnector;
                if (sUSDContract && walletAddress) {
                    const balance = await sUSDContract?.balanceOf(walletAddress);
                    return parseInt(balance) / 10 ** STABLE_DECIMALS.sUSD;
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

export default useSUSDWalletBalance;
