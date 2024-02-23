import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { Ticket } from 'types/markets';
import { updateTotalQuoteAndPayout } from '../../utils/markets';
import networkConnector from '../../utils/networkConnector';
import { mapTicket } from '../../utils/tickets';

export const useUserTicketsQuery = (
    user: string,
    networkId: Network,
    options?: UseQueryOptions<Ticket[] | undefined>
) => {
    return useQuery<Ticket[] | undefined>(
        QUERY_KEYS.UserTickets(networkId, user),
        async () => {
            try {
                const { sportsAMMDataContract } = networkConnector;
                if (sportsAMMDataContract) {
                    const [activeTickets, resolvedTickets] = await Promise.all([
                        sportsAMMDataContract.getActiveTicketsDataPerUser(user),
                        sportsAMMDataContract.getResolvedTicketsDataPerUser(user),
                    ]);

                    const tickets = [...activeTickets, ...resolvedTickets];

                    const mappedTickets: Ticket[] = tickets.map((ticket: any) => mapTicket(ticket, networkId));

                    return orderBy(updateTotalQuoteAndPayout(mappedTickets), ['timestamp'], ['desc']);
                }
                return undefined;
            } catch (e) {
                console.log('E ', e);
            }
        },
        {
            ...options,
        }
    );
};
