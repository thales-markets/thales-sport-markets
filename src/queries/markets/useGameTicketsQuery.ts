import axios from 'axios';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { Ticket } from 'types/markets';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import networkConnector from 'utils/networkConnector';
import { mapTicket } from 'utils/tickets';
import { generalConfig } from '../../config/general';

export const useGameTicketsQuery = (
    gameId: string,
    networkId: Network,
    options?: UseQueryOptions<Ticket[] | undefined>
) => {
    return useQuery<Ticket[] | undefined>(
        QUERY_KEYS.GameTickets(networkId, gameId),
        async () => {
            try {
                const { sportsAMMDataContract } = networkConnector;
                if (sportsAMMDataContract) {
                    const [tickets, gamesInfoResponse, playersInfoResponse] = await Promise.all([
                        sportsAMMDataContract.getTicketsDataPerGame(gameId),
                        axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`),
                        axios.get(`${generalConfig.API_URL}/overtime-v2/players-info`),
                    ]);

                    const mappedTickets: Ticket[] = tickets.map((ticket: any) =>
                        mapTicket(ticket, networkId, gamesInfoResponse.data, playersInfoResponse.data)
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
