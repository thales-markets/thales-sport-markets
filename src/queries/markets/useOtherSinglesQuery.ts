import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { orderBy } from 'lodash';
import { NetworkId } from 'thales-utils';
import { Ticket } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { getContractInstance } from 'utils/contract';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { isTestNetwork } from 'utils/network';
import { mapTicket } from 'utils/tickets';

export const useOtherSinglesQuery = (
    walletAddress: string,
    networkConfig: NetworkConfig,
    gameId: string,
    options?: Omit<UseQueryOptions<Ticket[] | null>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Ticket[] | null>({
        queryKey: QUERY_KEYS.OtherSingles(networkConfig.networkId, walletAddress, gameId),
        queryFn: async () => {
            let userTickets = null;

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

                if (sportsAMMDataContract && sportsAMMV2ManagerContract && freeBetHolderContract) {
                    const [
                        numOfActiveTicketsPerUser,
                        numOfActiveFreeBetTicketsPerUser,
                        numOfActiveStakedThalesTicketsPerUser,
                    ] = await Promise.all([
                        sportsAMMV2ManagerContract.read.numOfActiveTicketsPerUser([walletAddress]),
                        freeBetHolderContract.read.numOfActiveTicketsPerUser([walletAddress]),
                        networkConfig.networkId === NetworkId.Base
                            ? 0
                            : stakingThalesBettingProxy?.read.numOfActiveTicketsPerUser([walletAddress]),
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

                    promises.push(
                        axios.get(`${generalConfig.API_URL}/overtime-v2/games-info/${gameId}`, noCacheConfig)
                    );
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
                        .flat(1)
                        .filter((ticket: any) => {
                            return Number(ticket.numOfMarkets) === 1 && ticket.marketsData[0].gameId === gameId;
                        });

                    const gamesInfoResponse = promisesResult[promisesLength - 3];
                    const playersInfoResponse = promisesResult[promisesLength - 2];
                    const liveScoresResponse = promisesResult[promisesLength - 1];

                    const gameInfo = new Map();
                    gameInfo.set(gameId, gamesInfoResponse.data);

                    const mappedTickets: Ticket[] = tickets.map((ticket: any) =>
                        mapTicket(
                            ticket,
                            networkConfig.networkId,
                            Object.fromEntries(gameInfo),
                            playersInfoResponse.data,
                            liveScoresResponse.data
                        )
                    );

                    userTickets = orderBy(updateTotalQuoteAndPayout(mappedTickets), ['timestamp'], ['desc']);
                }
            } catch (e) {
                console.log('E ', e);
            }

            return userTickets;
        },
        ...options,
    });
};
