import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { orderBy } from 'lodash';
import { Ticket } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { isTestNetwork } from 'utils/network';
import { getContractInstance } from 'utils/networkConnector';

import { mapTicket } from 'utils/tickets';

export const useUserTicketsQuery = (
    user: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<Ticket[] | undefined>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Ticket[] | undefined>({
        queryKey: QUERY_KEYS.UserTickets(networkConfig.networkId, user),
        queryFn: async () => {
            try {
                const contracts = [
                    getContractInstance(ContractType.SPORTS_AMM_DATA, networkConfig.client, networkConfig.networkId),
                    getContractInstance(
                        ContractType.SPORTS_AMM_V2_MANAGER,
                        networkConfig.client,
                        networkConfig.networkId
                    ),
                    getContractInstance(ContractType.FREE_BET_HOLDER, networkConfig.client, networkConfig.networkId),
                    getContractInstance(
                        ContractType.STAKING_THALES_BETTING_PROXY,
                        networkConfig.client,
                        networkConfig.networkId
                    ),
                ] as ViemContract[];

                const [
                    sportsAMMDataContract,
                    sportsAMMV2ManagerContract,
                    freeBetHolderContract,
                    stakingThalesBettingProxy,
                ] = contracts;
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
                        sportsAMMV2ManagerContract.read.numOfActiveTicketsPerUser([user]),
                        sportsAMMV2ManagerContract.read.numOfResolvedTicketsPerUser([user]),
                        freeBetHolderContract.read.numOfActiveTicketsPerUser([user]),
                        freeBetHolderContract.read.numOfResolvedTicketsPerUser([user]),
                        stakingThalesBettingProxy.read.numOfActiveTicketsPerUser([user]),
                        stakingThalesBettingProxy.read.numOfResolvedTicketsPerUser([user]),
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

                    const playersInfoQueryParam = `isTestnet=${isTestNetwork(networkConfig.networkId)}`;

                    const promises = [];
                    for (let i = 0; i < numberOfActiveBatches; i++) {
                        promises.push(
                            sportsAMMDataContract.read.getActiveTicketsDataPerUser([user, i * BATCH_SIZE, BATCH_SIZE])
                        );
                    }
                    for (let i = 0; i < numberOfResolvedBatches; i++) {
                        promises.push(
                            sportsAMMDataContract.read.getResolvedTicketsDataPerUser([user, i * BATCH_SIZE, BATCH_SIZE])
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
                            networkConfig.networkId,
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
        ...options,
    });
};
