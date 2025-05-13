import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { generalConfig, noCacheConfig } from 'config/general';
import { LATEST_LIVE_REQUESTS_SIZE, LIVE_REQUETS_BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { LiveTradingFinalStatus, LiveTradingTicketStatus } from 'enums/markets';
import { bigNumberFormatter, coinFormatter } from 'thales-utils';
import { LiveTradingRequest, LiveTradingRequestsData } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { getCollateralByAddress } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { convertFromBytes32 } from 'utils/formatters/string';

const dataCache: LiveTradingRequestsData = { liveRequests: [], gamesInfo: {} };

export const useLiveTradingProcessorDataQuery = (
    walletAddress: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<LiveTradingRequestsData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LiveTradingRequestsData>({
        queryKey: QUERY_KEYS.LiveTradingProcessorData(networkConfig.networkId, walletAddress),
        queryFn: async () => {
            const data: LiveTradingRequestsData = { liveRequests: [], gamesInfo: {} };

            try {
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

                        data.gamesInfo = gamesInfoResponse.data;
                        dataCache.gamesInfo = gamesInfoResponse.data;
                        adapterRequests = adapterRequestsResponse.data;
                    }

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

                            let status = LiveTradingTicketStatus.REQUESTED;
                            let finalStatus = LiveTradingFinalStatus.IN_PROGRESS;
                            let errorReason = '';

                            if (isFulfilled) {
                                status = LiveTradingTicketStatus.COMPLETED;
                                finalStatus = LiveTradingFinalStatus.SUCCESS;
                            } else if (isAdapterFailed) {
                                status = LiveTradingTicketStatus.REQUESTED;
                                finalStatus = LiveTradingFinalStatus.FAILED;
                                errorReason = adapterRequest.message;
                            } else if (Date.now() > maturityTimestamp) {
                                status = isAdapterApproved
                                    ? LiveTradingTicketStatus.FULFILLING
                                    : LiveTradingTicketStatus.REQUESTED;
                                finalStatus = LiveTradingFinalStatus.FAILED;
                                errorReason = isAdapterApproved
                                    ? 'Failed to fulfill the trade.'
                                    : 'Failed to request the trade.';
                            } else if (isAdapterApproved) {
                                status = LiveTradingTicketStatus.APPROVED;
                                finalStatus = LiveTradingFinalStatus.IN_PROGRESS;
                            } else {
                                status = LiveTradingTicketStatus.REQUESTED;
                                finalStatus = LiveTradingFinalStatus.IN_PROGRESS;
                            }

                            const expectedQuote = bigNumberFormatter(request.expectedQuote);
                            const collateral = getCollateralByAddress(request.collateral, networkConfig.networkId);
                            const buyInAmount = coinFormatter(request.buyInAmount, networkConfig.networkId, collateral);

                            const liveTradingRequest: LiveTradingRequest = {
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
                                buyInAmount,
                                expectedQuote,
                                payout: buyInAmount / expectedQuote,
                                collateral,
                                status,
                                finalStatus,
                                errorReason,
                            };

                            data.liveRequests.push(liveTradingRequest);
                        });

                    dataCache.liveRequests = data.liveRequests;
                }
            } catch (e) {
                console.log('Failed to fetch live trading data', e);
            }

            return { ...dataCache, ...data };
        },
        ...options,
    });
};
