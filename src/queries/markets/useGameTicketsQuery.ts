import axios from 'axios';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { SportMarketInfoV2, Ticket } from 'types/markets';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import networkConnector from 'utils/networkConnector';
import { mapTicket } from 'utils/tickets';
import { generalConfig } from '../../config/general';

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
                    const [tickets, teamNamesResponse] = await Promise.all([
                        sportsAMMDataContract.getTicketsDataPerGame(market.gameId),
                        axios.get(`${generalConfig.API_URL}/overtime-v2/team-names`),
                    ]);

                    const mappedTickets: Ticket[] = tickets.map((ticket: any) =>
                        mapTicket(ticket, networkId, teamNamesResponse.data)
                    );

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