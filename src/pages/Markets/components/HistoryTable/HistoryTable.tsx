import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { formatTxTimestamp } from 'utils/formatters/date';
import Table from 'components/Table';
import { UserTransaction, UserTransactions } from 'types/markets';
import { formatCurrency } from '../../../../utils/formatters/number';

type HistoryPropsTable = {
    transactions: UserTransactions;
    noResultsMessage?: React.ReactNode;
    isLoading: boolean;
};

export const HistoryTable: FC<HistoryPropsTable> = memo(({ transactions, noResultsMessage, isLoading }) => {
    const { t } = useTranslation();
    return (
        <>
            <Table
                columns={[
                    {
                        Header: <>{t('market.table.date-time-col')}</>,
                        accessor: 'timestamp',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['timestamp']>) => (
                            <p>{formatTxTimestamp(cellProps.cell.value)}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>Game</>,
                        accessor: 'game',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['game']>) => (
                            <p>{cellProps.cell.value}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.type-col')}</>,
                        accessor: 'type',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['type']>) => (
                            <p>{t(`market.table.type.${cellProps.cell.value}`)}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.position-col')}</>,
                        accessor: 'position',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['position']>) => (
                            <p>{cellProps.cell.value}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.amount-col')}</>,
                        sortType: 'basic',
                        accessor: 'amount',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['amount']>) => (
                            <p>{cellProps.cell.value}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>Usd Value</>,
                        accessor: 'usdValue',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['usdValue']>) => (
                            <p>${formatCurrency(cellProps.cell.value)}</p>
                        ),
                        width: 150,
                    },
                    {
                        Header: <>Winner</>,
                        accessor: 'winner',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['winner']>) => (
                            <p>{cellProps.cell.value}</p>
                        ),
                        width: 150,
                    },
                ]}
                data={transactions}
                isLoading={isLoading}
                noResultsMessage={noResultsMessage}
                onTableRowClick={(e) => {
                    window.open(e.original.link, '_blank');
                }}
            />
        </>
    );
});

export default HistoryTable;
