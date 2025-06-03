import { useUserTicketsQuery } from 'queries/markets/useUserTicketsQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { Ticket } from 'types/markets';
import { RootState } from 'types/redux';
import { getCaseAccentInsensitiveString } from 'utils/formatters/string';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { isAddress } from 'viem';
import { useAccount, useChainId, useClient } from 'wagmi';
import TicketTransactionsTable from '../../../Markets/Market/MarketDetailsV2/components/TicketTransactionsTable';

const TicketTransactions: React.FC<{ searchText?: string }> = ({ searchText }) => {
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const isSearchTextWalletAddress = !!searchText && isAddress(searchText);

    const userTicketsQuery = useUserTicketsQuery(
        isSearchTextWalletAddress ? searchText : walletAddress,
        { networkId, client },
        { enabled: isSearchTextWalletAddress || isConnected }
    );

    const userTickets: Ticket[] = useMemo(() => {
        let userTickets: Ticket[] = [];

        if (userTicketsQuery.data && userTicketsQuery.isSuccess) {
            userTickets = userTicketsQuery.data || [];
        }

        if (searchText && !isSearchTextWalletAddress) {
            const normalizedSearch = getCaseAccentInsensitiveString(searchText);
            userTickets = userTickets.filter((item) => {
                const marketWithSearchTextIncluded = item.sportMarkets.find(
                    (item) =>
                        getCaseAccentInsensitiveString(item.homeTeam).includes(normalizedSearch) ||
                        getCaseAccentInsensitiveString(item.awayTeam).includes(normalizedSearch)
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
