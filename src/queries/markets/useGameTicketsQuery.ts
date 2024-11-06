import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { orderBy } from 'lodash';
import { UseQueryOptions, useQuery } from 'react-query';
import { Ticket } from 'types/markets';
import { SupportedNetwork } from 'types/network';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { isTestNetwork } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { mapTicket } from 'utils/tickets';

export const useGameTicketsQuery = (
    gameId: string,
    networkId: SupportedNetwork,
    options?: UseQueryOptions<Ticket[] | undefined>
) => {
    return useQuery<Ticket[] | undefined>(
        QUERY_KEYS.GameTickets(networkId, gameId),
        async () => {
            try {
                const { sportsAMMDataContract, sportsAMMV2ManagerContract } = networkConnector;
                if (sportsAMMDataContract && sportsAMMV2ManagerContract) {
                    const numOfActiveTicketsPerGame = await sportsAMMV2ManagerContract.numOfTicketsPerGame(gameId);
                    const numberOfActiveBatches = Math.trunc(Number(numOfActiveTicketsPerGame) / BATCH_SIZE) + 1;

                    const playersInfoQueryParam = `isTestnet=${isTestNetwork(networkId)}`;

                    const promises = [];
                    for (let i = 0; i < numberOfActiveBatches; i++) {
                        promises.push(sportsAMMDataContract.getTicketsDataPerGame(gameId, i * BATCH_SIZE, BATCH_SIZE));
                    }
                    promises.push(axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig));
                    promises.push(
                        axios.get(
                            `${generalConfig.API_URL}/overtime-v2/players-info?${playersInfoQueryParam}`,
                            noCacheConfig
                        )
                    );
                    promises.push(axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig));

                    const promisesResult = await Promise.all(promises);
                    const promisesLength = promises.length;

                    const tickets = promisesResult.slice(0, promisesLength - 3).flat(1);
                    const gamesInfoResponse = promisesResult[promisesLength - 3];
                    const playersInfoResponse = promisesResult[promisesLength - 2];
                    const liveScoresResponse = promisesResult[promisesLength - 1];

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
