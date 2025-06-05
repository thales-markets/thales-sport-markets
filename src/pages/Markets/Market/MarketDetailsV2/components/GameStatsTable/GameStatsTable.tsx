import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { orderBy } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';
import { formatCurrencyWithSign } from 'thales-utils';
import { MarketStats, SportMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { getTeamNameV2, getTitleText } from 'utils/marketsV2';
import { useChainId, useWalletClient } from 'wagmi';
import PositionsStats from '../PositionsStats';
import {
    ExpandedRowWrapper,
    FirstExpandedSection,
    LastExpandedSection,
    TableText,
    VolumeText,
    VolumeValue,
    VolumeWrapper,
    tableHeaderStyle,
    tableRowStyle,
} from './styled-components';

type GameStatsTableProps = {
    marketStats: MarketStats[];
    market: SportMarket;
    tableHeight?: string;
    tableStyle?: string;
    isLoading: boolean;
    ticketsPerPage?: number;
    expandAll?: boolean;
};

const GameStatsTable: React.FC<GameStatsTableProps> = ({
    marketStats,
    // market,
    tableHeight,
    tableStyle,
    isLoading,
    ticketsPerPage,
    expandAll,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();
    const walletClient = useWalletClient();

    const columns = [
        {
            header: <>{t('markets.stats.market')}</>,
            accessorKey: 'id',
            enableSorting: true,
            size: 450,
            cell: (cellProps: any) => {
                return (
                    <TableText width="100%">
                        {`${getTitleText(cellProps.row.original.market)}${
                            cellProps.row.original.market.isPlayerPropsMarket
                                ? ` - ${getTeamNameV2(cellProps.row.original.market, 0)}`
                                : ''
                        }${cellProps.row.original.market.line !== 0 ? ` (${cellProps.row.original.market.line})` : ''}`}
                    </TableText>
                );
            },
        },
        {
            header: <>{t('markets.stats.volume')}</>,
            accessorKey: 'totalBuyIn',
            enableSorting: true,
            size: 450,
            cell: (cellProps: any) => {
                return <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue())}</TableText>;
            },
            sortingFn: (rowA: any, rowB: any) => {
                return rowA.original.totalBuyIn - rowB.original.totalBuyIn;
            },
            sortDescFirst: true,
        },
    ];

    return (
        <>
            <Table
                tableHeight={tableHeight}
                tableStyle={tableStyle}
                tableHeadCellStyles={{
                    ...tableHeaderStyle,
                    color: theme.textColor.secondary,
                }}
                tableRowCellStyles={tableRowStyle}
                columnsDeps={[networkId, walletClient]}
                columns={columns as any}
                initialState={{
                    sorting: [
                        {
                            id: 'totalBuyIn',
                            desc: true,
                        },
                    ],
                }}
                rowsPerPage={ticketsPerPage}
                isLoading={isLoading}
                data={marketStats}
                noResultsMessage={t('market.table.no-results')}
                showPagination
                expandedRow={(row) => {
                    return (
                        <ExpandedRowWrapper>
                            <FirstExpandedSection>
                                <PositionsStats
                                    positionsStats={orderBy(row.original.positionStats, ['pnlIfWin'], ['asc'])}
                                    market={row.original.market}
                                />
                            </FirstExpandedSection>
                            <LastExpandedSection>
                                <VolumeWrapper>
                                    <VolumeValue>{t('markets.stats.market-volume')}:</VolumeValue>
                                    <VolumeText>{formatCurrencyWithSign(USD_SIGN, row.original.totalBuyIn)}</VolumeText>
                                </VolumeWrapper>
                            </LastExpandedSection>
                        </ExpandedRowWrapper>
                    );
                }}
                expandAll={expandAll}
            ></Table>
        </>
    );
};

export default GameStatsTable;
