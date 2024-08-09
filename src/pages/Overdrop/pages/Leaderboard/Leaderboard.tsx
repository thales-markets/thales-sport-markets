import Table from 'components/Table';
import { t } from 'i18next';
import { PaginationWrapper } from 'pages/ParlayLeaderboard/ParlayLeaderboard';
import useOverdropLeaderboardQuery from 'queries/overdrop/useOverdropLeaderboardQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useTheme } from 'styled-components';
import { FlexDiv } from 'styles/common';
import { formatCurrency, truncateAddress } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { getCurrentLevelByPoints } from 'utils/overdrop';
import { Badge, StickyCell, StickyContrainer, StickyRow, tableHeaderStyle, tableRowStyle } from './styled-components';

const Leaderboard: React.FC = () => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));

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

    const stickyRow = useMemo(() => {
        const data = leaderboard.find((row) => row.address.toLowerCase() == walletAddress?.toLowerCase());
        if (!data) return undefined;
        return (
            <StickyRow>
                <StickyContrainer>
                    <StickyCell width="50px">
                        <Badge src={data.level.smallBadge} />
                    </StickyCell>
                    <StickyCell>{truncateAddress(data.address)}</StickyCell>
                    <StickyCell style={{ minWidth: '50px' }} width="50px">
                        #{data.rank}
                    </StickyCell>
                    <StickyCell>
                        #{data.level.level} {data.level.levelName}
                    </StickyCell>
                    <StickyCell>{formatCurrency(data.points)}</StickyCell>
                    <StickyCell>{formatCurrency(data.volume)}</StickyCell>
                    <StickyCell>
                        <div>{formatCurrency(data.rewards.op)}OP</div>
                        <div>{formatCurrency(data.rewards.arb)}ARB</div>
                    </StickyCell>
                </StickyContrainer>
            </StickyRow>
        );
    }, [leaderboard, walletAddress]);

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
                stickyRow={stickyRow}
                columns={[
                    {
                        accessor: 'level.smallBadge',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <Badge style={{ width: '45px' }} src={cellProps.cell.value} />;
                        },
                        width: '50px',
                        maxWidth: 50,
                    },
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
                        width: '50px',
                        maxWidth: 50,
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
                                <>
                                    <div>{formatCurrency(cellProps.cell.value.op)}OP</div>
                                    <div>{formatCurrency(cellProps.cell.value.arb)}ARB</div>
                                </>
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
                <FlexDiv>
                    <PaginationWrapper
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        count={leaderboard.length}
                        labelRowsPerPage={t(`common.pagination.rows-per-page`)}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </FlexDiv>
            )}
        </div>
    );
};

export default Leaderboard;
