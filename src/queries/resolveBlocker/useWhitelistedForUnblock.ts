import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { NetworkConfig } from 'types/network';
import { getContractInstance } from 'utils/contract';

const useWhitelistedForUnblock = (
    walletAddress: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<boolean>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<boolean>({
        queryKey: QUERY_KEYS.ResolveBlocker.WhitelistedForUnblock(walletAddress, networkConfig.networkId),
        queryFn: async () => {
            const resolveBlockerContract = getContractInstance(ContractType.RESOLVE_BLOCKER, networkConfig);

            if (resolveBlockerContract) {
                const isWhitelistedForUnblock = await resolveBlockerContract.read.isWhitelistedForUnblock([
                    walletAddress,
                ]);
                return isWhitelistedForUnblock;
            }

            return false;
        },
        ...options,
    });
};

export default useWhitelistedForUnblock;
