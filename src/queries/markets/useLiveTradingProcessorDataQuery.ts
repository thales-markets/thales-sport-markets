import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { LiveTradingRequestStatus } from 'enums/markets';
import { bigNumberFormatter, getDefaultDecimalsForNetwork } from 'thales-utils';
import { LiveTradingProcessorData, LiveTradingRequest } from 'types/markets';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';
import { convertFromBytes32 } from 'utils/formatters/string';

const BATCH_SIZE = 1000;
const LATEST_REQUESTS_SIZE = 10;

const useLiveTradingProcessorDataQuery = (
    user: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<LiveTradingProcessorData>({
        queryKey: QUERY_KEYS.LiveTradingProcessorData(user, networkConfig.networkId),
        queryFn: async () => {
            const data: LiveTradingProcessorData = {
                requests: [],
            };

            const liveTradingProcessorDataContract = getContractInstance(
                ContractType.LIVE_TRADING_PROCESSOR_DATA,
                networkConfig
            ) as ViemContract;

            if (liveTradingProcessorDataContract) {
                const latestRequestsDataPerUser = await liveTradingProcessorDataContract.read.getLatestRequestsDataPerUser(
                    [user, BATCH_SIZE, LATEST_REQUESTS_SIZE]
                );

                latestRequestsDataPerUser
                    .filter((request: any) => Number(request.timestamp) !== 0)
                    .map((request: any) => {
                        const isFulfilled = request.isFulfilled;
                        const timestamp = secondsToMilliseconds(Number(request.timestamp));
                        const maturityTimestamp = secondsToMilliseconds(Number(request.maturityTimestamp));

                        const status = isFulfilled
                            ? LiveTradingRequestStatus.SUCCESS
                            : Date.now() > maturityTimestamp
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

                        data.requests.push(liveTradingRequest);
                    });
            }

            return data;
        },
        ...options,
    });
};

export default useLiveTradingProcessorDataQuery;
