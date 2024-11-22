import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import useLpTicketsQuery from 'queries/pnl/useLpTicketsQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Ticket } from 'types/markets';
import TicketTransactionsTable from '../../../Markets/Market/MarketDetailsV2/components/TicketTransactionsTable';

type LpTicketsProps = {
    lpCollateral: LiquidityPoolCollateral;
    round: number;
};

const LpTickets: React.FC<LpTicketsProps> = ({ lpCollateral, round }) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const lpTicketsQuery = useLpTicketsQuery(lpCollateral, round, networkId);

    const lpTickets: Ticket[] = useMemo(() => {
        let lpTickets: Ticket[] = [];

        if (lpTicketsQuery.data && lpTicketsQuery.isSuccess) {
            lpTickets = lpTicketsQuery.data || [];
        }

        return lpTickets;
    }, [lpTicketsQuery.data, lpTicketsQuery.isSuccess]);

    return (
        <TicketTransactionsTable
            ticketTransactions={lpTickets}
            isLoading={lpTicketsQuery.isLoading}
            tableHeight="auto"
            ticketsPerPage={20}
        />
    );
};

export default LpTickets;
