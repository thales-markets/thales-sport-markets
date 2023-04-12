import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import networkConnector from 'utils/networkConnector';
import { NetworkId } from 'types/network';
import { getDefaultDecimalsForNetwork } from 'utils/collaterals';

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
                    return parseInt(balance) / 10 ** getDefaultDecimalsForNetwork(networkId);
                }
                return 0;
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

export default useSUSDWalletBalance;
