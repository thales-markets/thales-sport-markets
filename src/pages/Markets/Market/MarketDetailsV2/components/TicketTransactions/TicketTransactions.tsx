import { useGameTicketsQuery } from 'queries/markets/useGameTicketsQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SportMarket } from 'types/markets';
import { useChainId, useClient } from 'wagmi';
import TicketTransactionsTable from '../TicketTransactionsTable';
import { Arrow, Container, Title } from './styled-components';

const ParlayTransactions: React.FC<{ market: SportMarket; isOnSelectedMarket?: boolean }> = ({
    market,
    isOnSelectedMarket,
}) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();

    const [openTable, setOpenTable] = useState<boolean>(false);

    const gameTicketsQuery = useGameTicketsQuery(market.gameId, { networkId, client });

    const gameTickets = useMemo(() => {
        if (gameTicketsQuery.data && gameTicketsQuery.isSuccess) {
            return gameTicketsQuery.data || [];
        }

        return [];
    }, [gameTicketsQuery.data, gameTicketsQuery.isSuccess]);

    return (
        <Container isOnSelectedMarket={isOnSelectedMarket} isOpen={openTable}>
            <Title
                onClick={() => {
                    isOnSelectedMarket && setOpenTable(!openTable);
                }}
            >
                {t('market.table.ticket-title')}
                {isOnSelectedMarket && (
                    <Arrow className={openTable ? 'icon icon--caret-down' : 'icon icon--caret-up'} />
                )}
            </Title>
            {(openTable || !isOnSelectedMarket) && (
                <TicketTransactionsTable
                    ticketTransactions={gameTickets}
                    market={market}
                    tableHeight={isOnSelectedMarket ? 'calc(100% - 107px)' : 'auto'}
                    tableStyle={isOnSelectedMarket ? 'overflow-y: hidden; max-height: calc(100vh - 478px);' : undefined}
                    isLoading={gameTicketsQuery.isLoading}
                />
            )}
        </Container>
    );
};

export default ParlayTransactions;
