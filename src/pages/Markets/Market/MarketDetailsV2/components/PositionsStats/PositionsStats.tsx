import { t } from 'i18next';
import React from 'react';
import { PositionStats, TicketMarket } from 'types/markets';
import PositionStatsRow from '../PositionStatsRow';
import { Header, PositionInfo, SelectionInfoContainer, TicketRow } from '../PositionStatsRow/styled-components';

type PositionsStatsProps = {
    positionsStats: PositionStats[];
    market: TicketMarket;
};

const PositionsStats: React.FC<PositionsStatsProps> = ({ positionsStats, market }) => {
    return (
        <>
            <TicketRow>
                <SelectionInfoContainer>
                    <PositionInfo>
                        <Header textAlign="start" marginLeft="0">
                            {t('markets.stats.position')}
                        </Header>
                    </PositionInfo>
                </SelectionInfoContainer>
                <Header>{t('markets.stats.volume')}</Header>
                <Header>{t('markets.stats.risk')}</Header>
                <Header>{t('markets.stats.pnl-if-win')}</Header>
            </TicketRow>
            {positionsStats.map((stats, index) => {
                return <PositionStatsRow key={`m-${index}`} positionStats={stats} market={market} />;
            })}
        </>
    );
};

export default PositionsStats;
