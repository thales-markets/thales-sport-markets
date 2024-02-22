import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { useQuery, UseQueryOptions } from 'react-query';
import { bigNumberFormatter, coinFormatter } from 'thales-utils';
import { UserStats } from 'types/markets';
import networkConnector from 'utils/networkConnector';

const useUsersStatsV2Query = (
    walletAddress: string,
    networkId: Network,
    options?: UseQueryOptions<UserStats | undefined>
) => {
    return useQuery<UserStats | undefined>(
        QUERY_KEYS.Wallet.StatsV2(networkId, walletAddress),
        async () => {
            const { sportsAMMDataContract } = networkConnector;
            if (sportsAMMDataContract) {
                const [activeTickets, resolvedTickets] = await Promise.all([
                    sportsAMMDataContract.getActiveTicketsDataPerUser(walletAddress),
                    sportsAMMDataContract.getResolvedTicketsDataPerUser(walletAddress),
                ]);

                const tickets = [...activeTickets, ...resolvedTickets];

                let volume = 0;
                let highestWin = 0;
                let lifetimeWins = 0;
                for (let index = 0; index < tickets.length; index++) {
                    const ticket = tickets[index];

                    const buyInAmount = coinFormatter(ticket.buyInAmount, networkId);
                    const buyInAmountAfterFees = coinFormatter(ticket.buyInAmountAfterFees, networkId);
                    const totalQuote = bigNumberFormatter(ticket.totalQuote);
                    const payout = buyInAmountAfterFees / totalQuote;

                    volume += buyInAmount;
                    if (ticket.isUserTheWinner && payout > highestWin) {
                        highestWin = payout;
                    }
                    if (ticket.isUserTheWinner) {
                        lifetimeWins += 1;
                    }
                }

                return {
                    id: walletAddress,
                    volume,
                    trades: tickets.length,
                    highestWin,
                    lifetimeWins,
                };
            }

            return undefined;
        },
        {
            ...options,
        }
    );
};

export default useUsersStatsV2Query;
