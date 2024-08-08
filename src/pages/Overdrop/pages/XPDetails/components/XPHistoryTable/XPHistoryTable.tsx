import Table from 'components/Table';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import { t } from 'i18next';
import useUserXPHistoryQuery from 'queries/overdrop/useUserXPHistoryQuery';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { CellProps } from 'react-table';
import { getIsAppReady } from 'redux/modules/app';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { formatTxTimestamp } from 'thales-utils';
import { OverdropXPHistory } from 'types/overdrop';
import { formatPoints } from 'utils/overdrop';

const XPHistoryTable: React.FC = () => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const userXPHistoryQuery = useUserXPHistoryQuery(walletAddress, {
        enabled: !!isAppReady,
    });

    const userXPHistory = useMemo(() => {
        if (userXPHistoryQuery?.isSuccess && userXPHistoryQuery?.data) {
            return userXPHistoryQuery.data;
        }
        return;
    }, [userXPHistoryQuery.data, userXPHistoryQuery?.isSuccess]);

    // ts-ignore
    return (
        <>
            <Table
                columns={[
                    {
                        Header: <>{t('overdrop.xp-details.date-time')}</>,
                        accessor: 'timestamp',
                        Cell: (cellProps: CellProps<OverdropXPHistory, OverdropXPHistory['timestamp']>) => (
                            <p>{formatTxTimestamp(cellProps.cell.value)}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('overdrop.xp-details.received')}</>,
                        accessor: 'points',
                        sortType: 'alphanumeric',
                        Cell: (cellProps: CellProps<OverdropXPHistory, OverdropXPHistory['points']>) => (
                            <p>{formatPoints(cellProps.cell.value)}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('overdrop.xp-details.tx-link')}</>,
                        accessor: 'txHash',
                        sortType: 'alphanumeric',
                        Cell: (cellProps: CellProps<OverdropXPHistory, OverdropXPHistory['txHash']>) => (
                            <ViewEtherscanLink hash={cellProps.cell.value} />
                        ),
                        width: 150,
                    },
                ]}
                data={userXPHistory ? userXPHistory : []}
                isLoading={userXPHistoryQuery.isLoading}
                noResultsMessage={t('overdrop.xp-details.no-results')}
                tableRowHeadStyles={{ minHeight: '35px' }}
                tableHeadCellStyles={{ fontSize: '14px' }}
                tableRowStyles={{ minHeight: '35px' }}
                tableRowCellStyles={{ fontSize: '13px' }}
            />
        </>
    );
};

export default XPHistoryTable;
