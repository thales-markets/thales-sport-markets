import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { NetworkConfig } from 'types/network';
import { getContractInstance } from 'utils/contract';
import { RiskManagementRole } from '../../enums/riskManagement';

const useWhitelistedAddressQuery = (
    walletAddress: string,
    role: RiskManagementRole,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<boolean>({
        queryKey: QUERY_KEYS.WhitelistedAddress(networkConfig.networkId, walletAddress, role),
        queryFn: async () => {
            try {
                const sportsAMMV2ManagerContract = getContractInstance(
                    ContractType.SPORTS_AMM_V2_MANAGER,
                    networkConfig
                );

                if (sportsAMMV2ManagerContract) {
                    const [owner, isWhitelisted] = await Promise.all([
                        sportsAMMV2ManagerContract.read.owner([]),
                        sportsAMMV2ManagerContract.read.isWhitelistedAddress([walletAddress, role]),
                    ]);

                    return isWhitelisted || owner.toLowerCase() === walletAddress.toLowerCase();
                }
            } catch (e) {
                console.log(e);
            }
            return false;
        },
        ...options,
    });
};

export default useWhitelistedAddressQuery;
