import MyTicket from 'components/ShareTicketModalV2/components/MyTicket';
import SimpleLoader from 'components/SimpleLoader';
import { useTicketQuery } from 'queries/markets/useTicketQuery';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import { Ticket as TicketData } from 'types/markets';
import { getTicketMarketOdd } from 'utils/tickets';

type TicketProps = RouteComponentProps<{
    ticketAddress: string;
}>;

const Ticket: React.FC<TicketProps> = (props) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const [lastValidTicket, setLastValidTicket] = useState<TicketData | undefined>(undefined);
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const { params } = props.match;
    const ticketAddress = params && params.ticketAddress ? params.ticketAddress : '';

    const ticketQuery = useTicketQuery(ticketAddress, networkId, {
        enabled: isAppReady,
    });

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
                    isTicketResolved={lastValidTicket.isResolved}
                    collateral={lastValidTicket.collateral}
                    isLive={lastValidTicket.isLive}
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
