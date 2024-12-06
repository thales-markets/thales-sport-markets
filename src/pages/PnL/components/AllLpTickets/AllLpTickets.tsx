import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { orderBy } from 'lodash';
import useLpTicketsQuery from 'queries/pnl/useLpTicketsQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Ticket } from 'types/markets';
import TicketTransactionsTable from '../../../Markets/Market/MarketDetailsV2/components/TicketTransactionsTable';

type AllLpTicketsProps = {
    round: number;
    showOnlyOpenTickets: boolean;
};

const AllLpTickets: React.FC<AllLpTicketsProps> = ({ round, showOnlyOpenTickets }) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const usdcLpTicketsQuery = useLpTicketsQuery(LiquidityPoolCollateral.USDC, round, networkId);
    const wethLpTicketsQuery = useLpTicketsQuery(LiquidityPoolCollateral.WETH, round, networkId);
    const thalesLpTicketsQuery = useLpTicketsQuery(LiquidityPoolCollateral.THALES, round, networkId);

    const lpTickets: Ticket[] = useMemo(() => {
        let lpTickets: Ticket[] = [];

        if (
            usdcLpTicketsQuery.data &&
            usdcLpTicketsQuery.isSuccess &&
            wethLpTicketsQuery.data &&
            wethLpTicketsQuery.isSuccess &&
            thalesLpTicketsQuery.data &&
            thalesLpTicketsQuery.isSuccess
        ) {
            lpTickets = [
                ...(usdcLpTicketsQuery.data || []),
                ...(wethLpTicketsQuery.data || []),
                ...(thalesLpTicketsQuery.data || []),
            ];
        }

        return orderBy(
            lpTickets.filter((ticket) => (ticket.isOpen && showOnlyOpenTickets) || !showOnlyOpenTickets),
            ['timestamp'],
            ['desc']
        );
    }, [
        showOnlyOpenTickets,
        thalesLpTicketsQuery.data,
        thalesLpTicketsQuery.isSuccess,
        usdcLpTicketsQuery.data,
        usdcLpTicketsQuery.isSuccess,
        wethLpTicketsQuery.data,
        wethLpTicketsQuery.isSuccess,
    ]);

    return (
        <TicketTransactionsTable
            ticketTransactions={lpTickets}
            isLoading={usdcLpTicketsQuery.isLoading || wethLpTicketsQuery.isLoading || thalesLpTicketsQuery.isLoading}
            tableHeight="auto"
            ticketsPerPage={20}
        />
    );
};

export default AllLpTickets;
