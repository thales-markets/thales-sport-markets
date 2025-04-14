import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { Ticket } from 'types/markets';
import { RootState } from 'types/redux';
import useBiconomy from 'utils/useBiconomy';
import { isAddress } from 'viem';
import { useAccount, useChainId, useClient } from 'wagmi';
import TicketTransactionsTable from '../../../Markets/Market/MarketDetailsV2/components/TicketTransactionsTable';

const TicketTransactions: React.FC<{ searchText?: string }> = ({ searchText }) => {
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const isSearchTextWalletAddress = searchText && isAddress(searchText);

    const userTicketsQuery = useUserTicketsQuery(
        isSearchTextWalletAddress ? searchText : walletAddress,
        { networkId, client },
        false,
        { enabled: isConnected }
    );

    const userTickets: Ticket[] = useMemo(() => {
        let userTickets: Ticket[] = [];

        if (userTicketsQuery.data && userTicketsQuery.isSuccess) {
            userTickets = (userTicketsQuery.data as Ticket[]) || [];
        }

        if (searchText && !isSearchTextWalletAddress) {
            userTickets = userTickets.filter((item) => {
                const marketWithSearchTextIncluded = item.sportMarkets.find(
                    (item) =>
                        item.homeTeam.toLowerCase().includes(searchText.toLowerCase()) ||
                        item.awayTeam.toLowerCase().includes(searchText.toLowerCase())
                );

                if (marketWithSearchTextIncluded) return item;
            });
        }

        return userTickets;
    }, [userTicketsQuery.data, userTicketsQuery.isSuccess, searchText, isSearchTextWalletAddress]);

    return (
        <TicketTransactionsTable
            ticketTransactions={userTickets}
            isLoading={userTicketsQuery.isLoading}
            tableHeight="auto"
            ticketsPerPage={20}
        />
    );
};

export default TicketTransactions;
