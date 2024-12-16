import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { SupportedNetwork } from 'types/network';
import networkConnector from 'utils/networkConnector';

const useWhitelistedForUnblock = (
    walletAddress: string,
    networkId: SupportedNetwork,
    options?: UseQueryOptions<boolean>
) => {
    return useQuery<boolean>(
        QUERY_KEYS.ResolveBlocker.WhitelistedForUnblock(walletAddress, networkId),
        async () => {
            const { resolveBlockerContract, sportsAMMV2ManagerContract } = networkConnector;
            if (resolveBlockerContract && sportsAMMV2ManagerContract) {
                const isWhitelistedForUnblock = await resolveBlockerContract.isWhitelistedForUnblock(walletAddress);
                return isWhitelistedForUnblock;
            }

            return false;
        },
        {
            ...options,
        }
    );
};

export default useWhitelistedForUnblock;
