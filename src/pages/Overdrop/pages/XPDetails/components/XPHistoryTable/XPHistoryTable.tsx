import Table from 'components/Table';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import { t } from 'i18next';
import useUserXPHistoryQuery from 'queries/overdrop/useUserXPHistoryQuery';
import React, { useMemo } from 'react';
import { formatTxTimestamp } from 'thales-utils';
import { formatPoints } from 'utils/overdrop';
import { useAccount } from 'wagmi';

const XPHistoryTable: React.FC = () => {
    const { address, isConnected } = useAccount();

    const userXPHistoryQuery = useUserXPHistoryQuery(address as string, { enabled: isConnected });

    const userXPHistory = useMemo(() => {
        if (userXPHistoryQuery?.isSuccess && userXPHistoryQuery?.data) {
            return userXPHistoryQuery.data.sort((a, b) => b.timestamp - a.timestamp);
        }
        return [];
    }, [userXPHistoryQuery.data, userXPHistoryQuery?.isSuccess]);

    const columns = [
        {
            header: <>{t('overdrop.xp-details.date-time')}</>,
            accessorKey: 'timestamp',
            cell: (cellProps: any) => (
                <p>{cellProps.cell.getValue() && formatTxTimestamp(cellProps.cell.getValue())}</p>
            ),
            size: 250,
            enableSorting: true,
        },
        {
            header: <>{t('overdrop.xp-details.received')}</>,
            accessorKey: 'points',
            sortType: 'alphanumeric',
            cell: (cellProps: any) => <p>{formatPoints(cellProps.cell.getValue())}</p>,
            size: 230,
            enableSorting: true,
        },
        {
            header: <>{t('overdrop.xp-details.tx-link')}</>,
            accessorKey: 'txHash',
            sortType: 'alphanumeric',
            cell: (cellProps: any) => (
                <ViewEtherscanLink overrideNetwork={cellProps.row.original.network} hash={cellProps.cell.getValue()} />
            ),
        },
    ];

    return (
        <Table
            columns={columns as any}
            rowsPerPage={20}
            tableHeight="auto"
            data={userXPHistory ? userXPHistory : []}
            isLoading={userXPHistoryQuery.isLoading}
            noResultsMessage={t('overdrop.xp-details.no-results')}
            showPagination
            tableRowHeadStyles={{ minHeight: '35px' }}
            tableHeadCellStyles={{ fontSize: '14px' }}
            tableRowStyles={{ minHeight: '35px' }}
            tableRowCellStyles={{ fontSize: '13px' }}
        />
    );
};

export default XPHistoryTable;
