import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Ticket } from 'types/markets';
import { LiquidityPoolCollateral } from '../../../../enums/liquidityPool';
import useLpHistory from '../../../../queries/wallet/useLpHistory';
import TicketTransactionsTable from '../../../Markets/Market/MarketDetailsV2/components/TicketTransactionsTable';

const TicketTransactions: React.FC<{ lpCollateral: LiquidityPoolCollateral }> = ({ lpCollateral }) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const userTicketsQuery = useLpHistory(lpCollateral, networkId);

    const userTickets: Ticket[] = useMemo(() => {
        let userTickets: Ticket[] = [];

        if (userTicketsQuery.data && userTicketsQuery.isSuccess) {
            userTickets = userTicketsQuery.data || [];
        }

        return userTickets;
    }, [userTicketsQuery.data, userTicketsQuery.isSuccess]);

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
