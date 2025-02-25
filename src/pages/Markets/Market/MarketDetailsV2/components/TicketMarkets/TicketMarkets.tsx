import React from 'react';
import { SportMarket, Ticket } from 'types/markets';
import TicketMarketRow from '../TicketMarketRow';

type TicketMarketsProps = {
    ticket: Ticket;
    market?: SportMarket;
    isWitelistedForResolve: boolean;
};

const TicketMarkets: React.FC<TicketMarketsProps> = ({ ticket, market, isWitelistedForResolve }) => {
    return ticket.sportMarkets.map((ticketMarket, index) => {
        const isCurrentMarket = market && ticketMarket.gameId === market.gameId;
        return (
            <TicketMarketRow
                key={`m-${index}`}
                ticketMarket={ticketMarket}
                isCurrentMarket={!!isCurrentMarket}
                isWitelistedForResolve={isWitelistedForResolve}
                isSgp={ticket.isSgp}
            />
        );
    });
};

export default TicketMarkets;
