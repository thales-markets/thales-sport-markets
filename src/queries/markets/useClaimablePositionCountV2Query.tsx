import { BATCH_SIZE } from 'constants/markets';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import networkConnector from 'utils/networkConnector';

const useClaimablePositionCountQuery = (
    walletAddress: string,
    networkId: Network,
    options?: UseQueryOptions<number | null>
) => {
    return useQuery<number | null>(
        QUERY_KEYS.ClaimableCountV2(walletAddress, networkId),
        async () => {
            try {
                const { sportsAMMDataContract, sportsAMMV2ManagerContract, freeBetHolderContract } = networkConnector;
                if (sportsAMMDataContract && sportsAMMV2ManagerContract && freeBetHolderContract) {
                    const [numOfActiveTicketsPerUser, numOfActiveFreeBetTicketsPerUser] = await Promise.all([
                        sportsAMMV2ManagerContract.numOfActiveTicketsPerUser(walletAddress),
                        freeBetHolderContract.numOfActiveTicketsPerUser(walletAddress),
                    ]);
                    const numberOfActiveBatches =
                        Math.trunc(
                            (Number(numOfActiveTicketsPerUser) > Number(numOfActiveFreeBetTicketsPerUser)
                                ? Number(numOfActiveTicketsPerUser)
                                : Number(numOfActiveFreeBetTicketsPerUser)) / BATCH_SIZE
                        ) + 1;

                    const promises = [];
                    for (let i = 0; i < numberOfActiveBatches; i++) {
                        promises.push(
                            sportsAMMDataContract.getActiveTicketsDataPerUser(walletAddress, i * BATCH_SIZE, BATCH_SIZE)
                        );
                    }
                    const promisesResult = await Promise.all(promises);

                    const tickets = promisesResult.map((allData) => allData.ticketsData).flat(1);

                    // Extract free bet tickets
                    const freeBetTickets = promisesResult
                        .map((allData) => allData.freeBetsData)
                        .flat(1)
                        .map((ticket) => {
                            return { ...ticket, isFreeBet: true };
                        });

                    tickets.push(...freeBetTickets);

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
