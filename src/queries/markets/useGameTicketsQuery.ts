import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { SportMarketInfoV2, Ticket } from 'types/markets';
import { updateTotalQuoteAndPayout } from 'utils/markets';
import networkConnector from 'utils/networkConnector';
import { mapTicket } from 'utils/tickets';

export const useGameTicketsQuery = (
    market: SportMarketInfoV2,
    networkId: Network,
    options?: UseQueryOptions<Ticket[] | undefined>
) => {
    return useQuery<Ticket[] | undefined>(
        QUERY_KEYS.GameTickets(networkId, market.gameId),
        async () => {
            try {
                const { sportsAMMDataContract } = networkConnector;
                if (sportsAMMDataContract) {
                    const tickets = await sportsAMMDataContract.getTicketsDataPerGame(market.gameId);

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
