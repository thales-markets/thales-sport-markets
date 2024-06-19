import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { Ticket } from 'types/markets';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import networkConnector from 'utils/networkConnector';
import { mapTicket } from 'utils/tickets';

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
                    const [
                        activeTickets,
                        resolvedTickets,
                        gamesInfoResponse,
                        playersInfoResponse,
                        liveScoresResponse,
                    ] = await Promise.all([
                        sportsAMMDataContract.getActiveTicketsDataPerUser(user, 0, BATCH_SIZE),
                        sportsAMMDataContract.getResolvedTicketsDataPerUser(user, 0, BATCH_SIZE),
                        axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                        axios.get(`${generalConfig.API_URL}/overtime-v2/players-info`, noCacheConfig),
                        axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig),
                    ]);

                    const tickets = [...activeTickets, ...resolvedTickets];

                    const mappedTickets: Ticket[] = tickets.map((ticket: any) =>
                        mapTicket(
                            ticket,
                            networkId,
                            gamesInfoResponse.data,
                            playersInfoResponse.data,
                            liveScoresResponse.data
                        )
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
