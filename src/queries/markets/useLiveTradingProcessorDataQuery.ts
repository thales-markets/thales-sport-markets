import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { LATEST_LIVE_REQUESTS_SIZE, LIVE_REQUETS_BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { LiveTradingFinalStatus, LiveTradingTicketStatus } from 'enums/markets';
import { t } from 'i18next';
import { bigNumberFormatter, coinFormatter } from 'thales-utils';
import { LiveTradingRequest, LiveTradingRequestRaw } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { getCollateralByAddress } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { convertFromBytes32 } from 'utils/formatters/string';
import { addTicketMarketToLiveTradingRequest } from 'utils/marketsV2';

export const useLiveTradingProcessorDataQuery = (
    walletAddress: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<LiveTradingRequest[]>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LiveTradingRequest[]>({
        queryKey: QUERY_KEYS.LiveTradingProcessorData(networkConfig.networkId, walletAddress),
        queryFn: async () => {
            let liveRequests: LiveTradingRequest[] = [];
            let gamesInfo: any = {};

            try {
                const liveTradingProcessorDataContract = getContractInstance(
                    ContractType.LIVE_TRADING_PROCESSOR_DATA,
                    networkConfig
                );

                const sportsAMMDataContract = getContractInstance(ContractType.SPORTS_AMM_DATA, networkConfig);

                if (liveTradingProcessorDataContract) {
                    const latestRequestsDataPerUser = await liveTradingProcessorDataContract.read.getLatestRequestsDataPerUser(
                        [walletAddress, LIVE_REQUETS_BATCH_SIZE, LATEST_LIVE_REQUESTS_SIZE]
                    );

                    const allRequestIds = latestRequestsDataPerUser
                        .filter((request: any) => Number(request.timestamp) !== 0)
                        .map((request: any) => request.requestId);

                    let adapterRequests = [];
                    if (allRequestIds.length > 0) {
                        const promisesResult = await Promise.all([
                            axios.get(`${generalConfig.API_URL}/overtime-v2/games-info`, noCacheConfig),
                            axios.get(
                                `${generalConfig.API_URL}/overtime-v2/networks/${
                                    networkConfig.networkId
                                }/live-trading/read-message/request/${
                                    allRequestIds[0]
                                }?requestIds=${allRequestIds.join()}`,
                                noCacheConfig
                            ),
                        ]);

                        const gamesInfoResponse = promisesResult[0];
                        const adapterRequestsResponse = promisesResult[1];

                        gamesInfo = gamesInfoResponse.data;
                        adapterRequests = adapterRequestsResponse.data;
                    }

                    const ticketIds: string[] = [];
                    latestRequestsDataPerUser
                        .filter((request: any) => Number(request.timestamp) !== 0)
                        .map((request: any) => {
                            const isFulfilled = request.isFulfilled;
                            const timestamp = secondsToMilliseconds(Number(request.timestamp));
                            const maturityTimestamp = secondsToMilliseconds(Number(request.maturityTimestamp));

                            const adapterRequest = adapterRequests.find(
                                (response: any) => response?.requestId === request.requestId
                            );
                            const isAdapterFailed = !!adapterRequest && adapterRequest.allow === false;
                            const isAdapterApproved = !!adapterRequest && adapterRequest.allow === true;

                            let status = LiveTradingTicketStatus.PENDING;
                            let finalStatus = LiveTradingFinalStatus.IN_PROGRESS;
                            let errorReason = '';

                            if (isFulfilled) {
                                ticketIds.push(request.ticketId);
                                status = LiveTradingTicketStatus.CREATED;
                                finalStatus = LiveTradingFinalStatus.SUCCESS;
                            } else if (isAdapterFailed) {
                                status = LiveTradingTicketStatus.PENDING;
                                finalStatus = LiveTradingFinalStatus.FAILED;
                                errorReason = adapterRequest.message;
                            } else if (Date.now() > maturityTimestamp) {
                                status = isAdapterApproved
                                    ? LiveTradingTicketStatus.APPROVED
                                    : LiveTradingTicketStatus.PENDING;
                                finalStatus = LiveTradingFinalStatus.FAILED;
                                errorReason = isAdapterApproved
                                    ? t('common.errors.tx-not-fulfilled')
                                    : t('common.errors.tx-request-failed');
                            } else if (isAdapterApproved) {
                                status = LiveTradingTicketStatus.APPROVED;
                                finalStatus = LiveTradingFinalStatus.IN_PROGRESS;
                            } else {
                                status = LiveTradingTicketStatus.PENDING;
                                finalStatus = LiveTradingFinalStatus.IN_PROGRESS;
                            }

                            const expectedQuote = bigNumberFormatter(request.expectedQuote);
                            const collateral = getCollateralByAddress(request.collateral, networkConfig.networkId);
                            const buyInAmount = coinFormatter(request.buyInAmount, networkConfig.networkId, collateral);

                            const gameId = convertFromBytes32(request.gameId);
                            const liveTradingRequestRaw: LiveTradingRequestRaw = {
                                user: request.user,
                                requestId: request.requestId,
                                ticketId: request.ticketId,
                                isFulfilled,
                                timestamp,
                                maturityTimestamp,
                                gameId,
                                leagueId: request.sportId,
                                typeId: request.typeId,
                                line: request.line / 100,
                                position: request.position,
                                buyInAmount,
                                expectedQuote,
                                totalQuote: expectedQuote,
                                payout: buyInAmount / expectedQuote,
                                collateral,
                                status,
                                finalStatus,
                                errorReason,
                            };

                            const liveTradingRequest: LiveTradingRequest = addTicketMarketToLiveTradingRequest(
                                liveTradingRequestRaw,
                                gamesInfo[gameId]
                            );

                            liveRequests.push(liveTradingRequest);
                        });

                    if (ticketIds.length > 0 && sportsAMMDataContract) {
                        const ticketsData = await sportsAMMDataContract.read.getTicketsData([ticketIds]);
                        const ticketsDataArray = [ticketsData].flat();
                        let fulfilledCounter = 0;
                        liveRequests = liveRequests.map((request) => {
                            let totalQuote = request.expectedQuote;
                            if (request.isFulfilled) {
                                totalQuote = bigNumberFormatter(ticketsDataArray[fulfilledCounter].totalQuote);
                                fulfilledCounter++;
                            }
                            const payout = request.buyInAmount / totalQuote;
                            return { ...request, totalQuote, payout };
                        });
                    }
                }
            } catch (e) {
                console.log('Failed to fetch live trading data', e);
            }

            return liveRequests;
        },
        ...options,
    });
};
