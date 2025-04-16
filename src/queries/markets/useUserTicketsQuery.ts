import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { BATCH_SIZE, LATEST_LIVE_REQUESTS_SIZE, LIVE_REQUETS_BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { LiveTradingRequestStatus } from 'enums/markets';
import { orderBy } from 'lodash';
import { bigNumberFormatter, getDefaultDecimalsForNetwork, NetworkId } from 'thales-utils';
import { LiveTradingRequest, Ticket, TicketsWithGamesInfo } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { getContractInstance } from 'utils/contract';
import { convertFromBytes32 } from 'utils/formatters/string';
import { updateTotalQuoteAndPayout } from 'utils/marketsV2';
import { isTestNetwork } from 'utils/network';
import { mapTicket } from 'utils/tickets';

export const useUserTicketsQuery = (
    walletAddress: string,
    networkConfig: NetworkConfig,
    fetchLiveRequests: boolean,
    options?: Omit<UseQueryOptions<TicketsWithGamesInfo>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<TicketsWithGamesInfo>({
        queryKey: QUERY_KEYS.UserTickets(networkConfig.networkId, walletAddress, fetchLiveRequests),
        queryFn: async () => {
            const data: TicketsWithGamesInfo = { tickets: [], liveRequests: [], gamesInfo: {} };

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
                        networkConfig.networkId === NetworkId.Base
                            ? 0
                            : stakingThalesBettingProxy?.read.numOfActiveTicketsPerUser([walletAddress]),
                        networkConfig.networkId === NetworkId.Base
                            ? 0
                            : stakingThalesBettingProxy?.read.numOfResolvedTicketsPerUser([walletAddress]),
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

                    const updatedTickets = updateTotalQuoteAndPayout(mappedTickets);
                    // don't sort when live requests are fetched as it will be combined and sorted after
                    const userTickets = fetchLiveRequests
                        ? updatedTickets
                        : orderBy(updatedTickets, ['timestamp'], ['desc']);

                    data.tickets = userTickets;
                    data.gamesInfo = gamesInfoResponse.data;
                }

                if (fetchLiveRequests) {
                    const liveTradingProcessorDataContract = getContractInstance(
                        ContractType.LIVE_TRADING_PROCESSOR_DATA,
                        networkConfig
                    );

                    if (liveTradingProcessorDataContract) {
                        const latestRequestsDataPerUser = await liveTradingProcessorDataContract.read.getLatestRequestsDataPerUser(
                            [walletAddress, LIVE_REQUETS_BATCH_SIZE, LATEST_LIVE_REQUESTS_SIZE]
                        );

                        const allRequestIds = latestRequestsDataPerUser
                            .filter((request: any) => Number(request.timestamp) !== 0)
                            .map((request: any) => request.requestId);

                        const adapterRequestsResponse = await fetch(
                            `${generalConfig.API_URL}/overtime-v2/networks/${
                                networkConfig.networkId
                            }/live-trading/read-message/request/${allRequestIds[0]}?requestIds=${allRequestIds.join()}`
                        );
                        const adapterRequestsStatus = await adapterRequestsResponse.json();

                        latestRequestsDataPerUser
                            .filter((request: any) => Number(request.timestamp) !== 0)
                            .map((request: any) => {
                                const isFulfilled = request.isFulfilled;
                                const timestamp = secondsToMilliseconds(Number(request.timestamp));
                                const maturityTimestamp = secondsToMilliseconds(Number(request.maturityTimestamp));

                                const adapterRequestStatus = adapterRequestsStatus.find(
                                    (response: any) => response?.requestId === request.requestId
                                );
                                const isAdapterFailed = adapterRequestStatus && adapterRequestStatus.allow === false;

                                const status = isFulfilled
                                    ? LiveTradingRequestStatus.SUCCESS
                                    : isAdapterFailed || Date.now() > maturityTimestamp
                                    ? LiveTradingRequestStatus.FAILED
                                    : LiveTradingRequestStatus.PENDING;

                                const liveTradingRequest = {
                                    user: request.user,
                                    requestId: request.requestId,
                                    isFulfilled,
                                    timestamp,
                                    maturityTimestamp,
                                    gameId: convertFromBytes32(request.gameId),
                                    leagueId: request.sportId,
                                    typeId: request.typeId,
                                    line: request.line / 100,
                                    position: request.position,
                                    buyInAmount: bigNumberFormatter(
                                        request.buyInAmount,
                                        getDefaultDecimalsForNetwork(networkConfig.networkId)
                                    ),
                                    status,
                                } as LiveTradingRequest;

                                data.liveRequests.push(liveTradingRequest);
                            });
                    }
                }
            } catch (e) {
                console.log('E ', e);
            }

            return data;
        },
        ...options,
    });
};
