import { LiquidityPoolCollateral } from 'enums/liquidityPool';
import { League } from 'enums/sports';
import useLpTicketsQuery from 'queries/pnl/useLpTicketsQuery';
import React, { useMemo } from 'react';
import { Ticket } from 'types/markets';
import { useChainId, useClient } from 'wagmi';
import TicketTransactionsTable from '../../../Markets/Market/MarketDetailsV2/components/TicketTransactionsTable';

type LpTicketsProps = {
    lpCollateral: LiquidityPoolCollateral;
    round: number;
    leagueId: League;
    onlyPP: boolean;
};

const LpTickets: React.FC<LpTicketsProps> = ({ lpCollateral, round, leagueId, onlyPP }) => {
    const networkId = useChainId();
    const client = useClient();

    const lpTicketsQuery = useLpTicketsQuery(lpCollateral, round, leagueId, onlyPP, { networkId, client });

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
