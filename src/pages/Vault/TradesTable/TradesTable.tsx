import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { formatTxTimestamp } from 'utils/formatters/date';
import Table from 'components/Table';
import styled from 'styled-components';
import { Position, PositionName } from 'constants/options';
import { buildMarketLink } from 'utils/routes';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import './style.css';
import i18n from 'i18n';
import { formatCurrency } from 'utils/formatters/number';
import SPAAnchor from 'components/SPAAnchor';
import { VaultTrade, VaultTrades } from 'types/vault';
import { VaultTradeStatus } from 'constants/vault';
import { Colors } from 'styles/common';
import PositionSymbol from 'components/PositionSymbol';
import { getOddTooltipText, getParentMarketAddress, getSpreadTotalText, getSymbolText } from 'utils/markets';

type TradesTableProps = {
    transactions: VaultTrades;
    noResultsMessage?: React.ReactNode;
    isLoading: boolean;
};

export const TradesTable: FC<TradesTableProps> = memo(({ transactions, noResultsMessage, isLoading }) => {
    const { t } = useTranslation();
    const language = i18n.language;
    // @ts-ignore
    return (
        <>
            <Table
                columns={[
                    {
                        Header: <>{t('market.table.date-time-col')}</>,
                        accessor: 'timestamp',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['timestamp']>) => (
                            <p>{formatTxTimestamp(cellProps.cell.value)}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.game-col')}</>,
                        accessor: 'game',
                        sortType: 'alphanumeric',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['game']>) => (
                            <SPAAnchor
                                className="hover-underline"
                                onClick={(e) => e.stopPropagation()}
                                href={buildMarketLink(
                                    getParentMarketAddress(
                                        cellProps.row.original.wholeMarket.parentMarket,
                                        cellProps.row.original.wholeMarket.address
                                    ),
                                    language
                                )}
                            >
                                {cellProps.cell.value}
                            </SPAAnchor>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.position-col')}</>,
                        accessor: 'position',
                        sortType: 'alphanumeric',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['position']>) => {
                            const symbolText = getSymbolText(
                                cellProps.cell.value,
                                cellProps.cell.row.original.wholeMarket
                            );

                            const spreadTotalText = getSpreadTotalText(
                                cellProps.cell.row.original.wholeMarket,
                                cellProps.cell.value
                            );
                            return (
                                <PositionSymbol
                                    symbolText={symbolText}
                                    symbolUpperText={
                                        spreadTotalText
                                            ? {
                                                  text: spreadTotalText,
                                                  textStyle: {
                                                      top: '-9px',
                                                  },
                                              }
                                            : undefined
                                    }
                                    tooltip={
                                        <>
                                            {getOddTooltipText(
                                                cellProps.cell.value,
                                                cellProps.cell.row.original.wholeMarket
                                            )}
                                        </>
                                    }
                                />
                            );
                        },
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.amount-col')}</>,
                        sortType: 'basic',
                        accessor: 'amount',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['amount']>) => (
                            <p>{formatCurrency(cellProps.cell.value)}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.usd-value-col')}</>,
                        accessor: 'paid',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['paid']>) => (
                            <p>${formatCurrency(cellProps.cell.value)}</p>
                        ),
                        width: 150,
                        sortable: true,
                        sortType: 'basic',
                    },
                    {
                        Header: <>{t('market.table.result-col')}</>,
                        accessor: 'result',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['result']>) => (
                            <>
                                {cellProps.row.original.status !== VaultTradeStatus.IN_PROGRESS && (
                                    <Status
                                        color={
                                            cellProps.row.original.status == VaultTradeStatus.WIN
                                                ? Colors.GREEN
                                                : Colors.RED
                                        }
                                    >
                                        {cellProps.row.original.status}
                                    </Status>
                                )}
                            </>
                        ),
                        width: 150,
                        sortable: true,
                        sortType: (rowA: any, rowB: any, _columnId?: string, desc?: boolean) => {
                            let aValue = (Position[rowA.original.result as PositionName] ?? -1) + 1;
                            let bValue = (Position[rowB.original.result as PositionName] ?? -1) + 1;
                            if (!aValue) {
                                aValue = desc ? -1 : 3;
                            }
                            if (!bValue) {
                                bValue = desc ? -1 : 3;
                            }
                            return aValue < bValue ? -1 : 1;
                        },
                    },
                    {
                        Header: <>{t('market.table.tx-status-col')}</>,
                        accessor: 'hash',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['hash']>) => (
                            <ViewEtherscanLink hash={cellProps.cell.value} />
                        ),
                        width: 150,
                    },
                ]}
                data={transactions}
                isLoading={isLoading}
                noResultsMessage={noResultsMessage}
                tableRowStyles={{ minHeight: '50px' }}
            />
        </>
    );
});

const Status = styled.span<{ color: string }>`
    color: ${(props) => props.color};
`;

export default TradesTable;
