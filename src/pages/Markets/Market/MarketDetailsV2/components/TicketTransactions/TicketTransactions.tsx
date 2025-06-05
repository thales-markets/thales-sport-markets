import { SelectedMarketOpenedTable } from 'enums/ui';
import { useGameTicketsQuery } from 'queries/markets/useGameTicketsQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SportMarket } from 'types/markets';
import { useChainId, useClient } from 'wagmi';
import TicketTransactionsTable from '../TicketTransactionsTable';
import { Arrow, Container, Title } from './styled-components';

type TicketTransactionsProps = {
    market: SportMarket;
    isOnSelectedMarket?: boolean;
    setOpenedTable?: (openedTable: SelectedMarketOpenedTable) => void;
};

const TicketTransactions: React.FC<TicketTransactionsProps> = ({ market, isOnSelectedMarket, setOpenedTable }) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();

    const [openTable, setOpenTable] = useState<boolean>(false);

    const gameTicketsQuery = useGameTicketsQuery(market.gameId, { networkId, client });

    const gameTickets = useMemo(() => {
        if (gameTicketsQuery.data && gameTicketsQuery.isSuccess) {
            return gameTicketsQuery.data.tickets || [];
        }

        return [];
    }, [gameTicketsQuery.data, gameTicketsQuery.isSuccess]);

    return (
        <Container isOnSelectedMarket={isOnSelectedMarket} isOpen={openTable}>
            <Title
                onClick={() => {
                    isOnSelectedMarket && setOpenTable(!openTable);
                    setOpenedTable &&
                        setOpenedTable(
                            openTable ? SelectedMarketOpenedTable.NONE : SelectedMarketOpenedTable.TICKET_TRANSACTIONS
                        );
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

export default TicketTransactions;
