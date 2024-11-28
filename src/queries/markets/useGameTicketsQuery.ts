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
import { getContractInstance } from 'utils/contract';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { isTestNetwork } from 'utils/network';
import { mapTicket } from 'utils/tickets';

export const useGameTicketsQuery = (
    gameId: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<Ticket[] | undefined>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Ticket[] | undefined>({
        queryKey: QUERY_KEYS.GameTickets(networkConfig.networkId, gameId),
        queryFn: async () => {
            try {
                const contractInstances = [
                    getContractInstance(ContractType.SPORTS_AMM_DATA, networkConfig),
                    getContractInstance(ContractType.SPORTS_AMM_V2_MANAGER, networkConfig),
                ] as ViemContract[];

                const [sportsAMMDataContract, sportsAMMV2ManagerContract] = contractInstances;

                if (sportsAMMDataContract && sportsAMMV2ManagerContract) {
                    const numOfActiveTicketsPerGame = await sportsAMMV2ManagerContract.read.numOfTicketsPerGame([
                        gameId,
                    ]);
                    const numberOfActiveBatches = Math.trunc(Number(numOfActiveTicketsPerGame) / BATCH_SIZE) + 1;

                    const playersInfoQueryParam = `isTestnet=${isTestNetwork(networkConfig.networkId)}`;

                    const promises = [];
                    for (let i = 0; i < numberOfActiveBatches; i++) {
                        promises.push(
                            sportsAMMDataContract.read.getTicketsDataPerGame([gameId, i * BATCH_SIZE, BATCH_SIZE])
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

                    const tickets = promisesResult.slice(0, promisesLength - 3).flat(1);
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
