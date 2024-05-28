import { useGameTicketsQuery } from 'queries/markets/useGameTicketsQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { SportMarket } from 'types/markets';
import TicketTransactionsTable from '../TicketTransactionsTable';
import { Container, Title } from './styled-components';

const ParlayTransactions: React.FC<{ market: SportMarket }> = ({ market }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const gameTicketsQuery = useGameTicketsQuery(market.gameId, networkId);

    const gameTickets = useMemo(() => {
        if (gameTicketsQuery.data && gameTicketsQuery.isSuccess) {
            return gameTicketsQuery.data || [];
        }

        return [];
    }, [gameTicketsQuery.data, gameTicketsQuery.isSuccess]);

    return (
        <Container>
            <Title>{t('market.table.ticket-title')}</Title>
            <TicketTransactionsTable
                ticketTransactions={gameTickets}
                market={market}
                tableHeight="calc(100% - 59px)"
                isLoading={gameTicketsQuery.isLoading}
            />
        </Container>
    );
};

export default ParlayTransactions;
