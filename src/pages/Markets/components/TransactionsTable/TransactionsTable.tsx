import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { formatTxTimestamp } from 'utils/formatters/date';
import Table from 'components/Table';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import { MarketTransaction, MarketTransactions } from 'types/markets';
import { formatCurrency } from 'utils/formatters/number';

type TransactionsTableProps = {
    transactions: MarketTransactions;
    noResultsMessage?: React.ReactNode;
    isLoading: boolean;
};

export const TransactionsTable: FC<TransactionsTableProps> = memo(({ transactions, noResultsMessage, isLoading }) => {
    const { t } = useTranslation();
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
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['position']>) => (
                            <p>{cellProps.cell.value?.toUpperCase()}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.paid-col')}</>,
                        sortType: paidSort(),
                        accessor: 'paid',
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['paid']>) => (
                            <p>$ {formatCurrency(cellProps.cell.value)}</p>
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
            />
        </>
    );
});

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
