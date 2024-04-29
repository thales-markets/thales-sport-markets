import { ethers } from 'ethers';
import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Ticket } from 'types/markets';
import TicketTransactionsTable from '../../../Markets/Market/MarketDetailsV2/components/TicketTransactionsTable';

const TicketTransactions: React.FC<{ searchText?: string }> = ({ searchText }) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const isSearchTextWalletAddress = searchText && ethers.utils.isAddress(searchText);

    const userTicketsQuery = useUserTicketsQuery(
        isSearchTextWalletAddress ? searchText : walletAddress.toLowerCase(),
        networkId,
        {
            enabled: isWalletConnected,
        }
    );

    const userTickets: Ticket[] = useMemo(() => {
        let userTickets: Ticket[] = [];

        if (userTicketsQuery.data && userTicketsQuery.isSuccess) {
            userTickets = userTicketsQuery.data || [];
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

    return <TicketTransactionsTable ticketTransactions={userTickets} isLoading={userTicketsQuery.isLoading} />;
};

export default TicketTransactions;
