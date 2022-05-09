import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import { formatTxTimestamp } from 'utils/formatters/date';
import Table from 'components/Table';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import { MarketTransaction, MarketTransactions } from 'types/markets';
import { PAYMENT_CURRENCY } from 'constants/currency';

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
                            <p>{t(`market.table.type.${cellProps.cell.value}`)}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.position-col')}</>,
                        accessor: 'position',
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['position']>) => (
                            <p>{cellProps.cell.value}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.amount-col')}</>,
                        sortType: 'basic',
                        accessor: 'amount',
                        Cell: (cellProps: CellProps<MarketTransaction, MarketTransaction['amount']>) => (
                            <p>{formatCurrencyWithKey(PAYMENT_CURRENCY, cellProps.cell.value)}</p>
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

export default TransactionsTable;
