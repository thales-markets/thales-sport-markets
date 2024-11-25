import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { orderBy } from 'lodash';
import { Ticket } from 'types/markets';
import { QueryConfig } from 'types/network';
import { getLpAddress } from 'utils/liquidityPool';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { getContractInstance } from 'utils/networkConnector';
import { mapTicket } from 'utils/tickets';

const useLpTicketsQuery = (
    lpCollateral: LiquidityPoolCollateral,
    round: number,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<Ticket[]>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Ticket[]>({
        queryKey: QUERY_KEYS.Pnl.LpTickets(lpCollateral, round, queryConfig.networkId),
        queryFn: async () => {
            const [sportsAMMDataContract, liquidityPoolDataContract] = await Promise.all([
                getContractInstance(ContractType.SPORTS_AMM_DATA, queryConfig.client, queryConfig.networkId),
                getContractInstance(ContractType.LIQUIDITY_POOL_DATA, queryConfig.client, queryConfig.networkId),
            ]);

            if (sportsAMMDataContract && liquidityPoolDataContract) {
                const [lpTickets, gamesInfoResponse, playersInfoResponse, liveScoresResponse] = await Promise.all([
                    liquidityPoolDataContract.read?.getRoundTickets(
                        getLpAddress(queryConfig.networkId, lpCollateral),
                        round
                    ),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/players-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig),
                ]);

                const numberOfBatches = Math.trunc(lpTickets.length / BATCH_SIZE) + 1;

                const promises = [];
                for (let i = 0; i < numberOfBatches; i++) {
                    promises.push(
                        sportsAMMDataContract.read?.getTicketsData(
                            lpTickets.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
                        )
                    );
                }

                const promisesResult = await Promise.all(promises);
                const ticketsData = promisesResult.flat(1);

                const mappedTickets: Ticket[] = ticketsData.map((ticket: any) =>
                    mapTicket(
                        ticket,
                        queryConfig.networkId,
                        gamesInfoResponse.data,
                        playersInfoResponse.data,
                        liveScoresResponse.data
                    )
                );

                const finalTickets: Ticket[] = orderBy(
                    updateTotalQuoteAndPayout(mappedTickets),
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
