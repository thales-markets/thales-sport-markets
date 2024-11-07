import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { orderBy } from 'lodash';
import { Ticket } from 'types/markets';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { isTestNetwork } from 'utils/network';
import { getContractInstance } from 'utils/networkConnector';

import { mapTicket } from 'utils/tickets';
import { generalConfig, noCacheConfig } from '../../config/general';

export const useTicketQuery = (
    ticketAddress: string,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<Ticket | undefined>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Ticket | undefined>({
        queryKey: QUERY_KEYS.Ticket(queryConfig.networkId, ticketAddress),
        queryFn: async () => {
            try {
                const sportsAMMDataContract = (await getContractInstance(
                    ContractType.SPORTS_AMM_DATA,
                    queryConfig.client,
                    queryConfig.networkId
                )) as ViemContract;
                if (sportsAMMDataContract) {
                    const playersInfoQueryParam = `isTestnet=${isTestNetwork(queryConfig.networkId)}`;

                    const [tickets, gamesInfoResponse, playersInfoResponse, liveScoresResponse] = await Promise.all([
                        sportsAMMDataContract.read.getTicketsData([ticketAddress]),
                        axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                        axios.get(
                            `${generalConfig.API_URL}/overtime-v2/players-info?${playersInfoQueryParam}`,
                            noCacheConfig
                        ),
                        axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig),
                    ]);

                    const mappedTickets: Ticket[] = tickets.map((ticket: any) =>
                        mapTicket(
                            ticket,
                            queryConfig.networkId,
                            gamesInfoResponse.data,
                            playersInfoResponse.data,
                            liveScoresResponse.data
                        )
                    );

                    return orderBy(updateTotalQuoteAndPayout(mappedTickets), ['timestamp'], ['desc'])[0];
                }
                return undefined;
            } catch (e) {
                console.log('E ', e);
            }
        },
        ...options,
    });
};
