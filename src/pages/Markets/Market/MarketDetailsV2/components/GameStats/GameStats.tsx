import { USD_SIGN } from 'constants/currency';
import { SelectedMarketOpenedTable } from 'enums/ui';
import { useGameTicketsQuery } from 'queries/markets/useGameTicketsQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlexDivSpaceBetween } from 'styles/common';
import { formatCurrencyWithSign } from 'thales-utils';
import { SportMarket } from 'types/markets';
import { useChainId, useClient } from 'wagmi';
import GameStatsTable from '../GameStatsTable';
import { Arrow, Container, Title, Volume } from './styled-components';

type GameStatsProps = {
    market: SportMarket;
    isOnSelectedMarket?: boolean;
    setOpenedTable?: (openedTable: SelectedMarketOpenedTable) => void;
};

const GameStats: React.FC<GameStatsProps> = ({ market, isOnSelectedMarket, setOpenedTable }) => {
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
            <FlexDivSpaceBetween>
                <Title
                    onClick={() => {
                        isOnSelectedMarket && setOpenTable(!openTable);
                        setOpenedTable &&
                            setOpenedTable(
                                openTable ? SelectedMarketOpenedTable.NONE : SelectedMarketOpenedTable.GAME_STATS
                            );
                    }}
                >
                    {t('markets.stats.title')}
                    {isOnSelectedMarket && (
                        <Arrow className={openTable ? 'icon icon--caret-down' : 'icon icon--caret-up'} />
                    )}
                </Title>
                <Volume>{`${t('markets.stats.volume')}: ${formatCurrencyWithSign(
                    USD_SIGN,
                    gameStats?.totalValume || 0,
                    2
                )}`}</Volume>
            </FlexDivSpaceBetween>
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
