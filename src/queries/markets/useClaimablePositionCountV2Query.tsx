import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import networkConnector from 'utils/networkConnector';

const useClaimablePositionCountQuery = (user: string, networkId: Network, options?: UseQueryOptions<number | null>) => {
    return useQuery<number | null>(
        QUERY_KEYS.ClaimableCountV2(user, networkId),
        async () => {
            try {
                const {
                    sportsAMMDataContract,
                    sportsAMMV2ManagerContract,
                    freeBetHolderContract,
                    stakingThalesBettingProxy,
                } = networkConnector;
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
                        sportsAMMV2ManagerContract.numOfActiveTicketsPerUser(user),
                        freeBetHolderContract.numOfActiveTicketsPerUser(user),
                        stakingThalesBettingProxy.numOfActiveTicketsPerUser(user),
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
                            sportsAMMDataContract.getActiveTicketsDataPerUser(user, i * BATCH_SIZE, BATCH_SIZE)
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
        {
            ...options,
        }
    );
};

export default useClaimablePositionCountQuery;
