import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { orderBy } from 'lodash';
import { Ticket } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { getContractInstance } from 'utils/contract';
import { getLpAddress, getRoundWithOffset, isLpAvailableForNetwork } from 'utils/liquidityPool';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { mapTicket } from 'utils/tickets';
import { League } from '../../enums/sports';

const useLpTicketsQuery = (
    lpCollateral: LiquidityPoolCollateral,
    round: number,
    leagueId: League,
    onlyPP: boolean,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<Ticket[]>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Ticket[]>({
        queryKey: QUERY_KEYS.Pnl.LpTickets(lpCollateral, round, leagueId, onlyPP, networkConfig.networkId),
        queryFn: async () => {
            const [sportsAMMDataContract, liquidityPoolDataContract] = [
                getContractInstance(ContractType.SPORTS_AMM_DATA, networkConfig),
                getContractInstance(ContractType.LIQUIDITY_POOL_DATA, networkConfig),
            ];

            if (sportsAMMDataContract && liquidityPoolDataContract) {
                const [
                    lpTickets,
                    gamesInfoResponse,
                    playersInfoResponse,
                    liveScoresResponse,
                    openMarketsResponse,
                    ongoingMarketsResponse,
                ] = await Promise.all([
                    isLpAvailableForNetwork(networkConfig.networkId, lpCollateral)
                        ? liquidityPoolDataContract.read.getRoundTickets([
                              getLpAddress(networkConfig.networkId, lpCollateral),
                              getRoundWithOffset(round, networkConfig.networkId, lpCollateral),
                          ])
                        : [],
                    axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/players-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig),
                    axios.get(
                        `${generalConfig.API_URL}/overtime-v2/networks/${networkConfig.networkId}/markets/?status=open&ungroup=true&onlyBasicProperties=true`,
                        noCacheConfig
                    ),
                    axios.get(
                        `${generalConfig.API_URL}/overtime-v2/networks/${networkConfig.networkId}/markets/?status=ongoing&ungroup=true&onlyBasicProperties=true`,
                        noCacheConfig
                    ),
                ]);

                const tickets = Array.isArray(lpTickets) ? lpTickets : [lpTickets];
                const numberOfBatches = Math.trunc(tickets.length / BATCH_SIZE) + 1;

                const promises = [];
                for (let i = 0; i < numberOfBatches; i++) {
                    promises.push(
                        sportsAMMDataContract.read.getTicketsData([tickets.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)])
                    );
                }

                const promisesResult = await Promise.all(promises);
                const ticketsData = promisesResult.flat(1);

                const openOngoingMarkets = [...openMarketsResponse.data, ...ongoingMarketsResponse.data];

                const mappedTickets: Ticket[] = ticketsData.map((ticket: any) =>
                    mapTicket(
                        ticket,
                        networkConfig.networkId,
                        gamesInfoResponse.data,
                        playersInfoResponse.data,
                        liveScoresResponse.data,
                        openOngoingMarkets
                    )
                );

                const finalTickets: Ticket[] = orderBy(
                    updateTotalQuoteAndPayout(mappedTickets).filter(
                        (ticket) =>
                            ((ticket.sportMarkets.length === 1 &&
                                ticket.sportMarkets[0].leagueId === leagueId &&
                                !!leagueId) ||
                                !leagueId) &&
                            ((ticket.sportMarkets.length === 1 &&
                                ticket.sportMarkets[0].isPlayerPropsMarket &&
                                !!onlyPP) ||
                                !onlyPP)
                    ),
                    ['timestamp'],
                    ['desc']
                );

                return finalTickets;
            }

            return [];
        },
        ...options,
    });
};

export default useLpTicketsQuery;
