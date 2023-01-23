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
import { getOddTooltipText, getSpreadTotalText, getSymbolText } from 'utils/markets';
import PositionSymbol from 'components/PositionSymbol';

type TransactionsTableProps = {
    transactions: MarketTransactions;
    noResultsMessage?: React.ReactNode;
    isLoading: boolean;
};

export const TransactionsTable: FC<TransactionsTableProps> = memo(({ transactions, noResultsMessage, isLoading }) => {
    const { t } = useTranslation();
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
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.type-col')}</>,
                        accessor: 'type',
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['type']>) => (
                            <p>{t(`market.table.type.${cellProps.cell.value}`).toUpperCase()}</p>
                        ),
                        width: 150,
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

                            const spreadTotalText = getSpreadTotalText(
                                cellProps.cell.row.original.wholeMarket,
                                cellProps.cell.value
                            );
                            return (
                                <PositionSymbol
                                    symbolText={symbolText}
                                    additionalStyle={{ width: 23, height: 23, fontSize: 10.5, borderWidth: 2 }}
                                    symbolUpperText={
                                        spreadTotalText
                                            ? {
                                                  text: spreadTotalText,
                                                  textStyle: {
                                                      backgroundColor: '#1A1C2B',
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
                            );
                        },
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.paid-col')}</>,
                        sortType: paidSort(),
                        accessor: 'paid',
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['paid']>) => (
                            <p>{cellProps.cell.value ? `$ ${formatCurrency(cellProps.cell.value)}` : 'N/A'}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.amount-col')}</>,
                        sortType: amountSort(),
                        accessor: 'amount',
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['amount']>) => (
                            <p>{formatCurrency(cellProps.cell.value)}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.tx-status-col')}</>,
                        accessor: 'hash',
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['hash']>) => (
                            <ViewEtherscanLink hash={cellProps.cell.value} />
                        ),
                        width: 150,
                    },
                ]}
                data={transactions}
                isLoading={isLoading}
                noResultsMessage={noResultsMessage}
                tableHeadCellStyles={isMobile ? TableHeaderStyleMobile : TableHeaderStyle}
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
    color: '#5F6180',
    justifyContent: 'flex-start',
};

const TableHeaderStyleMobile: React.CSSProperties = {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '10px',
    lineHeight: '12px',
    textTransform: 'uppercase',
    color: '#5F6180',
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
