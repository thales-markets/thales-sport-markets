import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { orderBy } from 'lodash';
import { Ticket } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { getContractInstance } from 'utils/contract';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { isTestNetwork } from 'utils/network';

import { mapTicket } from 'utils/tickets';

export const useUserTicketsQuery = (
    walletAddress: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<Ticket[] | undefined>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Ticket[] | undefined>({
        queryKey: QUERY_KEYS.UserTickets(networkConfig.networkId, walletAddress),
        queryFn: async () => {
            try {
                const sportsAMMDataContract = getContractInstance(ContractType.SPORTS_AMM_DATA, networkConfig);
                const sportsAMMV2ManagerContract = getContractInstance(
                    ContractType.SPORTS_AMM_V2_MANAGER,
                    networkConfig
                );
                const freeBetHolderContract = getContractInstance(ContractType.FREE_BET_HOLDER, networkConfig);
                const stakingThalesBettingProxy = getContractInstance(
                    ContractType.STAKING_THALES_BETTING_PROXY,
                    networkConfig
                );

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
                        sportsAMMV2ManagerContract.read.numOfActiveTicketsPerUser([walletAddress]),
                        sportsAMMV2ManagerContract.read.numOfResolvedTicketsPerUser([walletAddress]),
                        freeBetHolderContract.read.numOfActiveTicketsPerUser([walletAddress]),
                        freeBetHolderContract.read.numOfResolvedTicketsPerUser([walletAddress]),
                        stakingThalesBettingProxy.read.numOfActiveTicketsPerUser([walletAddress]),
                        stakingThalesBettingProxy.read.numOfResolvedTicketsPerUser([walletAddress]),
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
                            sportsAMMDataContract.read.getActiveTicketsDataPerUser([
                                walletAddress,
                                i * BATCH_SIZE,
                                BATCH_SIZE,
                            ])
                        );
                    }
                    for (let i = 0; i < numberOfResolvedBatches; i++) {
                        promises.push(
                            sportsAMMDataContract.read.getResolvedTicketsDataPerUser([
                                walletAddress,
                                i * BATCH_SIZE,
                                BATCH_SIZE,
                            ])
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
