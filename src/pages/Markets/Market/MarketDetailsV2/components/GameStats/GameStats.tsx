import { useGameTicketsQuery } from 'queries/markets/useGameTicketsQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SportMarket } from 'types/markets';
import { useChainId, useClient } from 'wagmi';
import GameStatsTable from '../GameStatsTable';
import { Arrow, Container, Title } from './styled-components';

const GameStats: React.FC<{ market: SportMarket; isOnSelectedMarket?: boolean }> = ({ market, isOnSelectedMarket }) => {
    const { t } = useTranslation();

    const networkId = useChainId();
    const client = useClient();

    const [openTable, setOpenTable] = useState<boolean>(false);

    const gameTicketsQuery = useGameTicketsQuery(market.gameId, { networkId, client });

    const gameStats = useMemo(() => {
        if (gameTicketsQuery.data && gameTicketsQuery.isSuccess) {
            return gameTicketsQuery.data.gameStats || undefined;
        }

        return undefined;
    }, [gameTicketsQuery.data, gameTicketsQuery.isSuccess]);

    return (
        <Container isOnSelectedMarket={isOnSelectedMarket} isOpen={openTable}>
            <Title
                onClick={() => {
                    isOnSelectedMarket && setOpenTable(!openTable);
                }}
            >
                {t('markets.stats.title')}
                {isOnSelectedMarket && (
                    <Arrow className={openTable ? 'icon icon--caret-down' : 'icon icon--caret-up'} />
                )}
            </Title>
            {(openTable || !isOnSelectedMarket) && (
                <GameStatsTable
                    marketStats={gameStats?.marketsStats || []}
                    market={market}
                    tableHeight={isOnSelectedMarket ? 'calc(100% - 107px)' : 'auto'}
                    tableStyle={isOnSelectedMarket ? 'overflow-y: hidden; max-height: calc(100vh - 478px);' : undefined}
                    isLoading={gameTicketsQuery.isLoading}
                />
            )}
        </Container>
    );
};

export default GameStats;
