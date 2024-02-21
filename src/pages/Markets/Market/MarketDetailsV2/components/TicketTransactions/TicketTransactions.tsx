import { useGameTicketsQuery } from 'queries/markets/useGameTicketsQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { SportMarketInfoV2 } from 'types/markets';
import TicketTransactionsTable from '../TicketTransactionsTable';
import { Container } from './styled-components';

const ParlayTransactions: React.FC<{ market: SportMarketInfoV2 }> = ({ market }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const gameTicketsQuery = useGameTicketsQuery(market, networkId);

    const gameTickets = useMemo(() => {
        if (gameTicketsQuery.data && gameTicketsQuery.isSuccess) {
            return gameTicketsQuery.data || [];
        }

        return [];
    }, [gameTicketsQuery.data, gameTicketsQuery.isSuccess]);

    return (
        <Container>
            <Title>{t('market.table.parlay-title')}</Title>
            <TicketTransactionsTable
                ticketTransactions={gameTickets}
                market={market}
                tableHeight="calc(100% - 68px)"
                isLoading={gameTicketsQuery.isLoading}
            />
        </Container>
    );
};

const Title = styled.span`
    display: block;
    width: 100%;
    font-style: normal;
    font-weight: bold;
    font-size: 18px;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 10px;
`;

export default ParlayTransactions;
