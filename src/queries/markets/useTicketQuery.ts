import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { orderBy } from 'lodash';
import { Ticket } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { isTestNetwork } from 'utils/network';

import { mapTicket } from 'utils/tickets';
import { generalConfig, noCacheConfig } from '../../config/general';

export const useTicketQuery = (
    ticketAddress: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<Ticket | undefined>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Ticket | undefined>({
        queryKey: QUERY_KEYS.Ticket(networkConfig.networkId, ticketAddress),
        queryFn: async () => {
            try {
                const sportsAMMDataContract = getContractInstance(
                    ContractType.SPORTS_AMM_DATA,
                    networkConfig
                ) as ViemContract;
                if (sportsAMMDataContract) {
                    const playersInfoQueryParam = `isTestnet=${isTestNetwork(networkConfig.networkId)}`;

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
                            networkConfig.networkId,
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
