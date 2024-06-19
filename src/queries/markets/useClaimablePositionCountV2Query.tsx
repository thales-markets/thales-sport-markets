import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import networkConnector from 'utils/networkConnector';

const useClaimablePositionCountQuery = (
    walletAddress: string,
    networkId: Network,
    options?: UseQueryOptions<number | null>
) => {
    return useQuery<number | null>(
        QUERY_KEYS.ClaimableCountV2(walletAddress, networkId),
        async () => {
            try {
                const { sportsAMMDataContract } = networkConnector;
                if (sportsAMMDataContract) {
                    const [activeTickets, resolvedTickets] = await Promise.all([
                        sportsAMMDataContract.getActiveTicketsDataPerUser(walletAddress, 0, BATCH_SIZE),
                        sportsAMMDataContract.getResolvedTicketsDataPerUser(walletAddress, 0, BATCH_SIZE),
                    ]);

                    const tickets = [...activeTickets, ...resolvedTickets];

                    const count = tickets.filter((ticket) => ticket.isUserTheWinner && !ticket.resolved).length;
                    return count;
                }
                return null;
            } catch (e) {
                console.log(e);
                return null;
            }
        },
        {
            ...options,
        }
    );
};

export default useClaimablePositionCountQuery;
