import MyTicket from 'components/ShareTicketModalV2/components/MyTicket';
import SimpleLoader from 'components/SimpleLoader';
import { useTicketQuery } from 'queries/markets/useTicketQuery';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { Ticket as TicketData } from 'types/markets';
import { getTicketMarketOdd } from 'utils/tickets';
import { useChainId, useClient } from 'wagmi';

const Ticket: React.FC = () => {
    const [lastValidTicket, setLastValidTicket] = useState<TicketData | undefined>(undefined);

    const networkId = useChainId();
    const client = useClient();

    const params = useParams() as { ticketAddress: string };
    const ticketAddress = params && params.ticketAddress ? params.ticketAddress : '';

    const ticketQuery = useTicketQuery(ticketAddress, { networkId, client });

    useEffect(() => {
        if (ticketQuery.isSuccess && ticketQuery.data) {
            setLastValidTicket(ticketQuery.data);
        }
    }, [ticketAddress, ticketQuery.isSuccess, ticketQuery.data]);

    useEffect(() => {
        setLastValidTicket(undefined);
    }, [networkId]);

    return (
        <Container>
            {lastValidTicket && !ticketQuery.isLoading ? (
                <MyTicket
                    markets={lastValidTicket.sportMarkets.map((sportMarket) => {
                        return {
                            ...sportMarket,
                            odd: getTicketMarketOdd(sportMarket),
                        };
                    })}
                    multiSingle={false}
                    paid={lastValidTicket.buyInAmount}
                    payout={lastValidTicket.payout}
                    isTicketLost={lastValidTicket.isLost}
                    collateral={lastValidTicket.collateral}
                    isLive={lastValidTicket.isLive}
                    applyPayoutMultiplier={false}
                />
            ) : (
                <LoaderContainer>
                    <SimpleLoader />
                </LoaderContainer>
            )}
        </Container>
    );
};

const Container = styled(FlexDivColumn)`
    position: relative;
    width: 386px;
    padding: 15px;
    flex: none;
    background: linear-gradient(180deg, #303656 0%, #1a1c2b 100%);
    border-radius: 10px;
    margin: 20px 0;
    @media (max-width: 950px) {
        width: 357px;
    }
`;

const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 228px;
    width: 100%;
`;

export default Ticket;
