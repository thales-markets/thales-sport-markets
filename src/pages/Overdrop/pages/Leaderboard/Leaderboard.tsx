import Table from 'components/Table';
import { t } from 'i18next';
import { PaginationWrapper } from 'pages/ParlayLeaderboard/ParlayLeaderboard';
import useOverdropLeaderboardQuery from 'queries/overdrop/useOverdropLeaderboardQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { useTheme } from 'styled-components';
import { formatCurrency, truncateAddress } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { getCurrentLevelByPoints } from 'utils/overdrop';
import { tableHeaderStyle, tableRowStyle } from './styled-components';

const Leaderboard: React.FC = () => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const leaderboardQuery = useOverdropLeaderboardQuery({ enabled: isAppReady });

    const leaderboard = useMemo(
        () =>
            leaderboardQuery.isSuccess
                ? leaderboardQuery.data.map((row) => ({ ...row, level: getCurrentLevelByPoints(row.points) }))
                : [],
        [leaderboardQuery.isSuccess, leaderboardQuery.data]
    );

    const theme: ThemeInterface = useTheme();

    const [page, setPage] = useState(0);
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    useEffect(() => setPage(0), [leaderboard.length]);

    return (
        <div>
            <Table
                tableHeight="auto"
                tableHeadCellStyles={{
                    ...tableHeaderStyle,
                    color: theme.overdrop.textColor.quinary,
                    backgroundColor: theme.overdrop.background.quinary,
                }}
                tableRowCellStyles={tableRowStyle}
                columns={[
                    {
                        Header: <>{t('overdrop.leaderboard.table.address')}</>,
                        accessor: 'address',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                <>
                                    <div>{truncateAddress(cellProps.cell.value)}</div>
                                </>
                            );
                        },
                    },
                    {
                        Header: <>{t('overdrop.leaderboard.table.rank')}</>,
                        accessor: 'rank',
                        sortable: true,
                        Cell: (cellProps: any) => {
                            return <div>#{cellProps.cell.value}</div>;
                        },
                    },
                    {
                        Header: <>{t('overdrop.leaderboard.table.level')}</>,
                        accessor: 'level',
                        sortable: true,
                        Cell: (cellProps: any) => {
                            return (
                                <div>
                                    #{cellProps.cell.value.level} {cellProps.cell.value.levelName}
                                </div>
                            );
                        },
                    },
                    {
                        Header: <>{t('overdrop.leaderboard.table.total-xp')}</>,
                        accessor: 'points',
                        sortable: true,
                        Cell: (cellProps: any) => {
                            return <div>{formatCurrency(cellProps.cell.value)}</div>;
                        },
                        sortDescFirst: true,
                    },
                    {
                        Header: <>{t('overdrop.leaderboard.table.total-volume')}</>,
                        accessor: 'volume',
                        sortable: true,
                        Cell: (cellProps: any) => {
                            return <div>{formatCurrency(cellProps.cell.value)}</div>;
                        },
                        sortDescFirst: true,
                    },
                    {
                        Header: <>{t('overdrop.leaderboard.table.rewards')}</>,
                        accessor: 'rewards',
                        sortable: true,
                        Cell: (cellProps: any) => {
                            return (
                                <div>
                                    {formatCurrency(cellProps.cell.value.op)} +
                                    {formatCurrency(cellProps.cell.value.arb)}
                                </div>
                            );
                        },
                        sortDescFirst: true,
                    },
                ]}
                initialState={{
                    sortBy: [
                        {
                            id: 'rank',
                            desc: false,
                        },
                    ],
                }}
                onSortByChanged={() => setPage(0)}
                currentPage={page}
                rowsPerPage={rowsPerPage}
                isLoading={leaderboardQuery.isLoading}
                data={leaderboard}
                noResultsMessage={t('market.table.no-results')}
            ></Table>
            {!leaderboardQuery.isLoading && leaderboard.length > 0 && (
                <PaginationWrapper
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    count={leaderboard.length}
                    labelRowsPerPage={t(`common.pagination.rows-per-page`)}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            )}
        </div>
    );
};

export default Leaderboard;
