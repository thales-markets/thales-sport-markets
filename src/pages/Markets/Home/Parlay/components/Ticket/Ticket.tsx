import React from 'react';
import { ParlaysMarket } from 'types/markets';

type TicketProps = {
    markets: ParlaysMarket[];
};

const Ticket: React.FC<TicketProps> = ({ markets }) => {
    console.log(markets);
    return <></>;
};

export default Ticket;
