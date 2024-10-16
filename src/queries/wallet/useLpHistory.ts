import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { orderBy } from 'lodash';
import { useQuery, UseQueryOptions } from 'react-query';
import { Ticket } from 'types/markets';
import { SupportedNetwork } from 'types/network';
import { getLpAddress } from 'utils/liquidityPool';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import networkConnector from 'utils/networkConnector';
import { mapTicket } from 'utils/tickets';

const useLpHistory = (
    lpCollateral: LiquidityPoolCollateral,
    round: number,
    networkId: SupportedNetwork,
    options?: UseQueryOptions<Ticket[]>
) => {
    return useQuery<Ticket[]>(
        QUERY_KEYS.Wallet.LpHistory(lpCollateral, round, networkId),
        async () => {
            const { sportsAMMDataContract, liquidityPoolDataContract } = networkConnector;
            if (sportsAMMDataContract && liquidityPoolDataContract) {
                const [lpTickets, gamesInfoResponse, playersInfoResponse, liveScoresResponse] = await Promise.all([
                    liquidityPoolDataContract.getRoundTickets(getLpAddress(networkId, lpCollateral), round),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/players-info`, noCacheConfig),
                    axios.get(`${generalConfig.API_URL}/overtime-v2/live-scores`, noCacheConfig),
                ]);

                const numberOfBatches = Math.trunc(lpTickets.length / BATCH_SIZE) + 1;

                const promises = [];
                for (let i = 0; i < numberOfBatches; i++) {
                    promises.push(
                        sportsAMMDataContract.getTicketsData(lpTickets.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE))
                    );
                }

                const promisesResult = await Promise.all(promises);
                const ticketsData = promisesResult.flat(1);

                const mappedTickets: Ticket[] = ticketsData.map((ticket: any) =>
                    mapTicket(
                        ticket,
                        networkId,
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
        {
            ...options,
        }
    );
};

export default useLpHistory;
