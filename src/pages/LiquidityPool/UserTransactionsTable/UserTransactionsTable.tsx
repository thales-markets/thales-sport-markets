import Table from 'components/Table';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, formatCurrencyWithKey, formatTxTimestamp, truncateAddress } from 'thales-utils';
import { LiquidityPoolUserTransactions } from 'types/liquidityPool';

type UserTransactionsTableProps = {
    transactions: LiquidityPoolUserTransactions;
    noResultsMessage?: React.ReactNode;
    isLoading: boolean;
    collateral: Coins;
};

const UserTransactionsTable: FC<UserTransactionsTableProps> = memo(
    ({ transactions, noResultsMessage, isLoading, collateral }) => {
        const { t } = useTranslation();

        const columns = [
            {
                header: <>{t('market.table.date-time-col')}</>,
                accessor: 'timestamp',
                cell: (cellProps: any) => <p>{formatTxTimestamp(cellProps.cell.getValue())}</p>,
                width: 150,
                enableSorting: true,
            },
            {
                header: <>{t('rewards.table.wallet-address')}</>,
                accessor: 'account',
                sortType: 'alphanumeric',
                cell: (cellProps: any) => <p>{truncateAddress(cellProps.cell.getValue(), 5)}</p>,
                width: 150,
                enableSorting: true,
            },
            {
                header: <>{t('market.table.type-col')}</>,
                accessor: 'type',
                sortType: 'alphanumeric',
                cell: (cellProps: any) => (
                    <p>{t(`liquidity-pool.user-transactions.type.${cellProps.cell.getValue()}`)}</p>
                ),
                width: 150,
                enableSorting: true,
            },
            {
                header: <>{t('market.table.amount-col')}</>,
                sortType: 'basic',
                accessor: 'amount',
                cell: (cellProps: any) => (
                    <>
                        <p>
                            {cellProps.cell.row.original.type === 'withdrawalRequest'
                                ? '-'
                                : formatCurrencyWithKey(collateral, cellProps.cell.getValue())}
                        </p>
                    </>
                ),
                width: 150,
                enableSorting: true,
            },
            {
                header: <>{t('market.table.tx-status-col')}</>,
                accessor: 'hash',
                cell: (cellProps: any) => <ViewEtherscanLink hash={cellProps.cell.getValue()} />,
                width: 150,
            },
        ];
        // @ts-ignore
        return (
            <>
                <Table
                    columns={columns as any}
                    data={transactions}
                    isLoading={isLoading}
                    noResultsMessage={noResultsMessage}
                    tableRowHeadStyles={{ minHeight: '35px' }}
                    tableHeadCellStyles={{ fontSize: '14px' }}
                    tableRowStyles={{ minHeight: '35px' }}
                    tableRowCellStyles={{ fontSize: '13px' }}
                    columnsDeps={[collateral]}
                />
            </>
        );
    }
);

export default UserTransactionsTable;
