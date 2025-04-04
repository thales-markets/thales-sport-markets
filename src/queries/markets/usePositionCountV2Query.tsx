import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { minutesToMilliseconds } from 'date-fns';
import { ContractType } from 'enums/contract';
import { NetworkId } from 'thales-utils';
import { NetworkConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractInstance } from 'utils/contract';

const usePositionCountV2Query = (
    user: string,
    networkConfig: NetworkConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<{ claimable: number; open: number }>({
        queryKey: QUERY_KEYS.PositionsCountV2(user, networkConfig.networkId),
        queryFn: async () => {
            const positionsCount = { claimable: 0, open: 0 };

            try {
                const contractInstances = [
                    getContractInstance(ContractType.SPORTS_AMM_DATA, networkConfig),
                    getContractInstance(ContractType.SPORTS_AMM_V2_MANAGER, networkConfig),
                    getContractInstance(ContractType.FREE_BET_HOLDER, networkConfig),
                    getContractInstance(ContractType.STAKING_THALES_BETTING_PROXY, networkConfig),
                ] as ViemContract[];

                const [
                    sportsAMMDataContract,
                    sportsAMMV2ManagerContract,
                    freeBetHolderContract,
                    stakingThalesBettingProxy,
                ] = contractInstances;

                if (sportsAMMDataContract && sportsAMMV2ManagerContract && freeBetHolderContract) {
                    const [
                        numOfActiveTicketsPerUser,
                        numOfActiveFreeBetTicketsPerUser,
                        numOfActiveStakedThalesTicketsPerUser,
                    ] = await Promise.all([
                        sportsAMMV2ManagerContract.read.numOfActiveTicketsPerUser([user]),
                        freeBetHolderContract.read.numOfActiveTicketsPerUser([user]),
                        networkConfig.networkId === NetworkId.Base
                            ? 0
                            : stakingThalesBettingProxy?.read.numOfActiveTicketsPerUser([user]),
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

                    positionsCount.claimable = tickets.filter(
                        (ticket) => ticket.isUserTheWinner && !ticket.resolved
                    ).length;
                    positionsCount.open = tickets.filter((ticket) => !ticket.isExercisable && !ticket.resolved).length;
                }
            } catch (e) {
                console.log(e);
            }
            return positionsCount;
        },
        refetchInterval: minutesToMilliseconds(5),
        ...options,
    });
};

export default usePositionCountV2Query;
