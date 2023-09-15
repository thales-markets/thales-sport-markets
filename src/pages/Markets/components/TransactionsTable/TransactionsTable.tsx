import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { formatTxTimestamp } from 'utils/formatters/date';
import Table from 'components/Table';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import { MarketTransaction, MarketTransactions } from 'types/markets';
import { formatCurrency } from 'utils/formatters/number';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsMobile } from 'redux/modules/app';
import { getMarketName, getOddTooltipText, getSpreadTotalText, getSymbolText, isPlayerProps } from 'utils/markets';
import PositionSymbol from 'components/PositionSymbol';
import { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';

type TransactionsTableProps = {
    transactions: MarketTransactions;
    noResultsMessage?: React.ReactNode;
    isLoading: boolean;
};

const TransactionsTable: FC<TransactionsTableProps> = memo(({ transactions, noResultsMessage, isLoading }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    return (
        <>
            <Table
                columns={[
                    {
                        Header: <>{t('market.table.date-time-col')}</>,
                        accessor: 'timestamp',
                        sortType: timestampSort(),
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['timestamp']>) => (
                            <p>{formatTxTimestamp(cellProps.cell.value)}</p>
                        ),
                        width: '150px',
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.type-col')}</>,
                        accessor: 'type',
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['type']>) => (
                            <p>{t(`market.table.type.${cellProps.cell.value}`).toUpperCase()}</p>
                        ),
                        width: '80px',
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.position-col')}</>,
                        accessor: 'position',
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['position']>) => {
                            const symbolText = getSymbolText(
                                cellProps.cell.value,
                                cellProps.cell.row.original.wholeMarket
                            );
                            const isOneSideMarket = cellProps.cell.row.original.wholeMarket.isOneSideMarket;
                            const spreadTotalText = getSpreadTotalText(
                                cellProps.cell.row.original.wholeMarket,
                                cellProps.cell.value
                            );
                            const additionalText =
                                isPlayerProps(cellProps.cell.row.original.wholeMarket.betType) && !isMobile
                                    ? getMarketName(cellProps.cell.row.original.wholeMarket, cellProps.cell.value)
                                    : '';
                            return symbolText ? (
                                <PositionSymbol
                                    symbolText={symbolText}
                                    symbolAdditionalText={{
                                        text: additionalText,
                                        textStyle: { marginLeft: 24, whiteSpace: 'pre-wrap' },
                                    }}
                                    additionalStyle={{
                                        width: 23,
                                        height: 23,
                                        fontSize: isOneSideMarket ? 8.5 : 10.5,
                                        borderWidth: 2,
                                    }}
                                    symbolUpperText={
                                        spreadTotalText
                                            ? {
                                                  text: spreadTotalText,
                                                  textStyle: {
                                                      backgroundColor: theme.background.primary,
                                                      fontSize: '10px',
                                                      top: '-8px',
                                                      left: '13px',
                                                      lineHeight: '100%',
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
                            ) : (
                                <p>N/A</p>
                            );
                        },
                        minWidth: 200,
                        width: '200px',
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.paid-col')}</>,
                        sortType: paidSort(),
                        accessor: 'paid',
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['paid']>) => (
                            <p>{cellProps.cell.value ? `$ ${formatCurrency(cellProps.cell.value)}` : 'N/A'}</p>
                        ),
                        width: '100px',
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.amount-col')}</>,
                        sortType: amountSort(),
                        accessor: 'amount',
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['amount']>) => (
                            <p>{formatCurrency(cellProps.cell.value)}</p>
                        ),
                        width: '100px',
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.tx-status-col')}</>,
                        accessor: 'hash',
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['hash']>) => (
                            <ViewEtherscanLink hash={cellProps.cell.value} />
                        ),
                        width: '100px',
                    },
                ]}
                data={transactions}
                isLoading={isLoading}
                noResultsMessage={noResultsMessage}
                tableHeadCellStyles={{
                    ...(isMobile ? TableHeaderStyleMobile : TableHeaderStyle),
                    color: theme.textColor.secondary,
                }}
                tableRowStyles={{ fontSize: '12px' }}
            />
        </>
    );
});

const TableHeaderStyle: React.CSSProperties = {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '12px',
    lineHeight: '12px',
    textTransform: 'uppercase',
    justifyContent: 'flex-start',
};

const TableHeaderStyleMobile: React.CSSProperties = {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '10px',
    lineHeight: '12px',
    textTransform: 'uppercase',
    justifyContent: 'center',
};

const paidSort = () => (rowA: any, rowB: any) => {
    return rowA.original.paid - rowB.original.paid;
};

const amountSort = () => (rowA: any, rowB: any) => {
    return rowA.original.amount - rowB.original.amount;
};

const timestampSort = () => (rowA: any, rowB: any) => {
    return rowA.original.timestamp - rowB.original.timestamp;
};

export default TransactionsTable;
