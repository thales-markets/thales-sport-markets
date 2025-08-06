import Table from 'components/Table';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import { XP_POINTS_TYPE } from 'constants/overdrop';
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
            size: 150,
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
            cell: (cellProps: any) => {
                if (cellProps.row.original.type !== 'daily' && cellProps.row.original.type !== 'wheel') {
                    return (
                        <ViewEtherscanLink
                            overrideNetwork={cellProps.row.original.network}
                            hash={
                                cellProps.row.original.type === 'referral'
                                    ? cellProps.row.original.refferalTxHash
                                    : cellProps.cell.getValue()
                            }
                        />
                    );
                }
            },
        },
        {
            header: <>{t('overdrop.xp-details.type')}</>,
            accessorKey: 'type',
            sortType: 'alphanumeric',
            cell: (cellProps: any) => {
                const typeKey = cellProps.cell.getValue() as keyof typeof XP_POINTS_TYPE;
                return <>{XP_POINTS_TYPE[typeKey]}</>;
            },
            size: 250,
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
