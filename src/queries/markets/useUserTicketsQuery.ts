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

export const useUserTicketsQuery = (
    user: string,
    networkId: SupportedNetwork,
    options?: UseQueryOptions<Ticket[] | undefined>
) => {
    return useQuery<Ticket[] | undefined>(
        QUERY_KEYS.UserTickets(networkId, user),
        async () => {
            try {
                const {
                    sportsAMMDataContract,
                    sportsAMMV2ManagerContract,
                    freeBetHolderContract,
                    stakingThalesBettingProxy,
                } = networkConnector;
                if (
                    sportsAMMDataContract &&
                    sportsAMMV2ManagerContract &&
                    freeBetHolderContract &&
                    stakingThalesBettingProxy
                ) {
                    const [
                        numOfActiveTicketsPerUser,
                        numOfResolvedTicketsPerUser,
                        numOfActiveFreeBetTicketsPerUser,
                        numOfResolvedFreeBetTicketsPerUser,
                        numOfActiveStakedThalesTicketsPerUser,
                        numOfResolvedStakedThalesTicketsPerUser,
                    ] = await Promise.all([
                        sportsAMMV2ManagerContract.numOfActiveTicketsPerUser(user),
                        sportsAMMV2ManagerContract.numOfResolvedTicketsPerUser(user),
                        freeBetHolderContract.numOfActiveTicketsPerUser(user),
                        freeBetHolderContract.numOfResolvedTicketsPerUser(user),
                        stakingThalesBettingProxy.numOfActiveTicketsPerUser(user),
                        stakingThalesBettingProxy.numOfResolvedTicketsPerUser(user),
                    ]);

                    const numberOfActiveBatches =
                        Math.trunc(
                            (Number(numOfActiveTicketsPerUser) > Number(numOfActiveFreeBetTicketsPerUser) &&
                            Number(numOfActiveTicketsPerUser) > Number(numOfActiveStakedThalesTicketsPerUser)
                                ? Number(numOfActiveTicketsPerUser)
                                : Number(numOfActiveFreeBetTicketsPerUser) >
                                  Number(numOfActiveStakedThalesTicketsPerUser)
                                ? Number(numOfActiveFreeBetTicketsPerUser)
                                : Number(numOfActiveStakedThalesTicketsPerUser)) / BATCH_SIZE
                        ) + 1;
                    const numberOfResolvedBatches =
                        Math.trunc(
                            (Number(numOfResolvedTicketsPerUser) > Number(numOfResolvedFreeBetTicketsPerUser) &&
                            Number(numOfResolvedTicketsPerUser) > Number(numOfResolvedStakedThalesTicketsPerUser)
                                ? Number(numOfResolvedTicketsPerUser)
                                : Number(numOfResolvedFreeBetTicketsPerUser) >
                                  Number(numOfResolvedStakedThalesTicketsPerUser)
                                ? Number(numOfResolvedFreeBetTicketsPerUser)
                                : Number(numOfResolvedStakedThalesTicketsPerUser)) / BATCH_SIZE
                        ) + 1;

                    const playersInfoQueryParam = `isTestnet=${isTestNetwork(networkId)}`;

                    const promises = [];
                    for (let i = 0; i < numberOfActiveBatches; i++) {
                        promises.push(
                            sportsAMMDataContract.getActiveTicketsDataPerUser(user, i * BATCH_SIZE, BATCH_SIZE)
                        );
                    }
                    for (let i = 0; i < numberOfResolvedBatches; i++) {
                        promises.push(
                            sportsAMMDataContract.getResolvedTicketsDataPerUser(user, i * BATCH_SIZE, BATCH_SIZE)
                        );
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

                    const tickets = promisesResult
                        .slice(0, promisesLength - 3)
                        .map((allData) => [
                            ...allData.ticketsData,
                            ...allData.freeBetsData,
                            ...allData.stakingBettingProxyData,
                        ])
                        .flat(1);

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
