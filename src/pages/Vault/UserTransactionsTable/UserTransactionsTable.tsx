import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { formatTxTimestamp } from 'utils/formatters/date';
import Table from 'components/Table';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import { formatCurrency } from 'utils/formatters/number';
import { VaultUserTransaction, VaultUserTransactions } from 'types/vault';
import { truncateAddress } from 'utils/formatters/string';

type UserTransactionsTableProps = {
    transactions: VaultUserTransactions;
    noResultsMessage?: React.ReactNode;
    isLoading: boolean;
};

export const UserTransactionsTable: FC<UserTransactionsTableProps> = memo(
    ({ transactions, noResultsMessage, isLoading }) => {
        const { t } = useTranslation();
        // @ts-ignore
        return (
            <>
                <Table
                    columns={[
                        {
                            Header: <>{t('market.table.date-time-col')}</>,
                            accessor: 'timestamp',
                            Cell: (cellProps: CellProps<VaultUserTransaction, VaultUserTransaction['timestamp']>) => (
                                <p>{formatTxTimestamp(cellProps.cell.value)}</p>
                            ),
                            width: 150,
                            sortable: true,
                        },
                        {
                            Header: <>{t('rewards.table.wallet-address')}</>,
                            accessor: 'account',
                            sortType: 'alphanumeric',
                            Cell: (cellProps: CellProps<VaultUserTransaction, VaultUserTransaction['account']>) => (
                                <p>{truncateAddress(cellProps.cell.value, 5)}</p>
                            ),
                            width: 150,
                            sortable: true,
                        },
                        {
                            Header: <>{t('market.table.type-col')}</>,
                            accessor: 'type',
                            sortType: 'alphanumeric',
                            Cell: (cellProps: CellProps<VaultUserTransaction, VaultUserTransaction['type']>) => (
                                <p>{t(`vault.user-transactions.type.${cellProps.cell.value}`)}</p>
                            ),
                            width: 150,
                            sortable: true,
                        },
                        {
                            Header: <>{t('market.table.amount-col')}</>,
                            sortType: 'basic',
                            accessor: 'amount',
                            Cell: (cellProps: CellProps<VaultUserTransaction, VaultUserTransaction['amount']>) => (
                                <>
                                    <p>
                                        {cellProps.cell.row.original.type === 'withdrawalRequest'
                                            ? '-'
                                            : `$${formatCurrency(cellProps.cell.value)}`}
                                    </p>
                                </>
                            ),
                            width: 150,
                            sortable: true,
                        },
                        {
                            Header: <>{t('market.table.tx-status-col')}</>,
                            accessor: 'hash',
                            Cell: (cellProps: CellProps<VaultUserTransaction, VaultUserTransaction['hash']>) => (
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
    }
);

export default UserTransactionsTable;
