import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import useLpHistory from 'queries/wallet/useLpHistory';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Ticket } from 'types/markets';
import TicketTransactionsTable from '../../../Markets/Market/MarketDetailsV2/components/TicketTransactionsTable';

type TicketTransactionsProps = {
    lpCollateral: LiquidityPoolCollateral;
    round: number;
};

const TicketTransactions: React.FC<TicketTransactionsProps> = ({ lpCollateral, round }) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const userTicketsQuery = useLpHistory(lpCollateral, round, networkId);

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
