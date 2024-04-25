import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { getDefaultDecimalsForNetwork } from 'thales-utils';
import networkConnector from 'utils/networkConnector';
import QUERY_KEYS from '../../constants/queryKeys';

const useSUSDWalletBalance = (
    walletAddress: string,
    networkId: Network,
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
