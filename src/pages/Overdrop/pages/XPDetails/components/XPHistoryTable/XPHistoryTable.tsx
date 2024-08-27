import PaginationWrapper from 'components/PaginationWrapper';
import Table from 'components/Table';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import { t } from 'i18next';
import useUserXPHistoryQuery from 'queries/overdrop/useUserXPHistoryQuery';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CellProps } from 'react-table';
import { getIsAppReady } from 'redux/modules/app';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDiv } from 'styles/common';
import { formatTxTimestamp } from 'thales-utils';
import { OverdropXPHistory } from 'types/overdrop';
import { formatPoints } from 'utils/overdrop';

const XPHistoryTable: React.FC = () => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';

    const [page, setPage] = useState(0);
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };
    const userXPHistoryQuery = useUserXPHistoryQuery(walletAddress, {
        enabled: !!isAppReady,
    });

    const userXPHistory = useMemo(() => {
        if (userXPHistoryQuery?.isSuccess && userXPHistoryQuery?.data) {
            return userXPHistoryQuery.data.sort((a, b) => b.timestamp - a.timestamp);
        }
        return [];
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
                            <p>{cellProps.cell.value && formatTxTimestamp(cellProps.cell.value)}</p>
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
                            <ViewEtherscanLink
                                overrideNetwork={cellProps.row.original.network}
                                hash={cellProps.cell.value}
                            />
                        ),
                        width: 150,
                    },
                ]}
                currentPage={page}
                rowsPerPage={rowsPerPage}
                tableHeight="auto"
                data={userXPHistory ? userXPHistory : []}
                isLoading={userXPHistoryQuery.isLoading}
                noResultsMessage={t('overdrop.xp-details.no-results')}
                tableRowHeadStyles={{ minHeight: '35px' }}
                tableHeadCellStyles={{ fontSize: '14px' }}
                tableRowStyles={{ minHeight: '35px' }}
                tableRowCellStyles={{ fontSize: '13px' }}
            />
            {!userXPHistoryQuery.isLoading && userXPHistory.length > 0 && (
                <FlexDiv>
                    <PaginationWrapper
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        count={userXPHistory.length}
                        labelRowsPerPage={t(`common.pagination.rows-per-page`)}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </FlexDiv>
            )}
        </>
    );
};

export default XPHistoryTable;
