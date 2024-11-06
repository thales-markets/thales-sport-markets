import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { ContractType } from 'enums/contract';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/networkConnector';

const useClaimablePositionCountQuery = (
    user: string,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<number | null>({
        queryKey: QUERY_KEYS.ClaimableCountV2(user, queryConfig.networkId),
        queryFn: async () => {
            try {
                const contractInstances = (await Promise.all([
                    getContractInstance(ContractType.SPORTS_AMM_DATA, queryConfig.client, queryConfig.networkId),
                    getContractInstance(ContractType.SPORTS_AMM_V2_MANAGER, queryConfig.client, queryConfig.networkId),
                    getContractInstance(ContractType.FREE_BET_HOLDER, queryConfig.client, queryConfig.networkId),
                    getContractInstance(
                        ContractType.STAKING_THALES_BETTING_PROXY,
                        queryConfig.client,
                        queryConfig.networkId
                    ),
                ])) as ViemContract[];

                const [
                    sportsAMMDataContract,
                    sportsAMMV2ManagerContract,
                    freeBetHolderContract,
                    stakingThalesBettingProxy,
                ] = contractInstances;

                if (
                    sportsAMMDataContract &&
                    sportsAMMV2ManagerContract &&
                    freeBetHolderContract &&
                    stakingThalesBettingProxy
                ) {
                    const [
                        numOfActiveTicketsPerUser,
                        numOfActiveFreeBetTicketsPerUser,
                        numOfActiveStakedThalesTicketsPerUser,
                    ] = await Promise.all([
                        sportsAMMV2ManagerContract.read.numOfActiveTicketsPerUser([user]),
                        freeBetHolderContract.read.numOfActiveTicketsPerUser([user]),
                        stakingThalesBettingProxy.read.numOfActiveTicketsPerUser([user]),
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

                    const promises = [];
                    for (let i = 0; i < numberOfActiveBatches; i++) {
                        promises.push(
                            sportsAMMDataContract.read.getActiveTicketsDataPerUser([user, i * BATCH_SIZE, BATCH_SIZE])
                        );
                    }
                    const promisesResult = await Promise.all(promises);

                    const tickets = promisesResult
                        .map((allData) => [
                            ...allData.ticketsData,
                            ...allData.freeBetsData,
                            ...allData.stakingBettingProxyData,
                        ])
                        .flat(1);

                    const count = tickets.filter((ticket) => ticket.isUserTheWinner && !ticket.resolved).length;
                    return count;
                }
                return null;
            } catch (e) {
                console.log(e);
                return null;
            }
        },
        ...options,
    });
};

export default useClaimablePositionCountQuery;
