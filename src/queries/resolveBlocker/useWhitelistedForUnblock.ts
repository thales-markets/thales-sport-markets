import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';
import { SupportedNetwork } from 'types/network';
import networkConnector from 'utils/networkConnector';
import { ContractRole } from '../../enums/markets';

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
                const [owner, hasMarketResolvingRole, hasTicketPauserRole] = await Promise.all([
                    resolveBlockerContract.owner(),
                    sportsAMMV2ManagerContract.whitelistedAddresses(walletAddress, ContractRole.MARKET_RESOLVING),
                    sportsAMMV2ManagerContract.whitelistedAddresses(walletAddress, ContractRole.TICKET_PAUSER),
                ]);

                return (
                    owner.toLowerCase() === walletAddress.toLowerCase() || hasMarketResolvingRole || hasTicketPauserRole
                );
            }

            return false;
        },
        {
            ...options,
        }
    );
};

export default useWhitelistedForUnblock;
