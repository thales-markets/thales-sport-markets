import Tooltip from 'components/Tooltip';
import useLeaderboardByGuessedCorrectlyQuery, {
    LeaderboardByGuessedCorrectlyResponse,
} from 'queries/marchMadness/useLeaderboardByGuessedCorrectlyQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Column, usePagination, useTable } from 'react-table';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { getEtherscanAddressLink } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { truncateAddress } from 'utils/formatters/string';
import {
    Arrow,
    NoDataContainer,
    NoDataLabel,
    OverlayContainer,
    PaginationWrapper,
    StickyRowTopTable,
    Table,
    TableContainer,
    TableHeader,
    TableHeaderCell,
    TableHeaderContainer,
    TableRow,
    TableRowCell,
} from '../TableByVolume/styled-components';

type TableByGuessedCorrectlyProps = {
    searchText: string;
};

const TableByGuessedCorrectly: React.FC<TableByGuessedCorrectlyProps> = ({ searchText }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));

    const columns: Column[] = useMemo(() => {
        return [
            {
                Header: '',
                accessor: 'rank',
            },

            {
                Header: <>{t('march-madness.leaderboard.bracket-id')}</>,
                accessor: 'bracketId',
                Cell: (cellProps) => <>#{cellProps.cell.value}</>,
            },
            {
                Header: <>{t('march-madness.leaderboard.owner')}</>,
                accessor: 'owner',
                Cell: (cellProps) => (
                    <>
                        {truncateAddress(cellProps.cell.value, 5)}
                        <a
                            href={getEtherscanAddressLink(networkId, cellProps.cell.value)}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Arrow />
                        </a>
                    </>
                ),
            },
            {
                Header: () => (
                    <>
                        {t('march-madness.leaderboard.guessed-games')}
                        <Tooltip
                            overlayInnerStyle={{
                                backgroundColor: theme.marchMadness.background.secondary,
                                border: `1px solid ${theme.marchMadness.borderColor.primary}`,
                            }}
                            overlay={
                                <OverlayContainer>
                                    {t('march-madness.leaderboard.tooltip-correct-correct-table')}
                                </OverlayContainer>
                            }
                            iconFontSize={14}
                            marginLeft={2}
                            top={0}
                        />
                    </>
                ),
                accessor: 'totalPoints',
            },
            {
                Header: () => (
                    <>
                        {t('march-madness.leaderboard.rewards')}
                        <Tooltip
                            overlayInnerStyle={{
                                backgroundColor: theme.marchMadness.background.secondary,
                                border: `1px solid ${theme.marchMadness.borderColor.primary}`,
                            }}
                            overlay={
                                <OverlayContainer>
                                    {t('march-madness.leaderboard.tooltip-rewards-correct-table')}
                                </OverlayContainer>
                            }
                            iconFontSize={14}
                            marginLeft={2}
                            top={0}
                        />
                    </>
                ),
                accessor: 'rewards',
            },
        ];
    }, [t, networkId, theme.marchMadness.borderColor.primary, theme.marchMadness.background.secondary]);

    const leaderboardQuery = useLeaderboardByGuessedCorrectlyQuery(networkId);

    const data = useMemo(() => {
        if (leaderboardQuery.isSuccess && leaderboardQuery.data) return leaderboardQuery.data;
        return [];
    }, [leaderboardQuery.data, leaderboardQuery.isSuccess]);

    const myScore = useMemo(() => {
        if (data) {
            return data.filter((user) => user.owner.toLowerCase() == walletAddress?.toLowerCase());
        }
        return [];
    }, [data, walletAddress]);

    const filteredData = useMemo(() => {
        let finalData: LeaderboardByGuessedCorrectlyResponse = [];
        if (data) {
            finalData = data;

            if (searchText?.trim() !== '') {
                finalData = data.filter((user) => user.owner.toLowerCase().includes(searchText.toLowerCase()));
            }

            return finalData;
        }

        return [];
    }, [data, searchText]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        rows,
        state,
        gotoPage,
        setPageSize,
        page,
    } = useTable(
        {
            columns,
            data: filteredData,
            initialState: {
                pageIndex: 0,
                pageSize: 20,
            },
        },
        usePagination
    );

    const handleChangePage = (_event: unknown, newPage: number) => {
        gotoPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPageSize(Number(event.target.value));
        gotoPage(0);
    };

    const stickyRow = useMemo(() => {
        if (myScore?.length) {
            return (
                <StickyRowTopTable myScore={true}>
                    <TableRowCell>{myScore[0].rank}</TableRowCell>
                    <TableRowCell>#{myScore[0].bracketId}</TableRowCell>
                    <TableRowCell>{t('march-madness.leaderboard.my-rewards').toUpperCase()}</TableRowCell>
                    <TableRowCell>{myScore[0].totalPoints}</TableRowCell>
                    <TableRowCell>{myScore[0].rewards}</TableRowCell>
                </StickyRowTopTable>
            );
        }
    }, [myScore, t]);
    console.log(rows.length);
    return (
        <Container>
            <TableHeaderContainer>
                <TableHeader>{t('march-madness.leaderboard.by-guessed-correctly')}</TableHeader>
            </TableHeaderContainer>
            <TableContainer isEmpty={!filteredData?.length}>
                {!filteredData?.length && (
                    <NoDataContainer>
                        <NoDataLabel>{t('march-madness.leaderboard.no-data')}</NoDataLabel>
                    </NoDataContainer>
                )}
                {filteredData?.length > 0 && (
                    <Table {...getTableProps()}>
                        <thead>
                            {headerGroups.map((headerGroup, headerGroupIndex) => (
                                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroupIndex}>
                                    {headerGroup.headers.map((column, columnKey) => (
                                        <TableHeaderCell {...column.getHeaderProps()} key={columnKey}>
                                            {column.render('Header')}
                                        </TableHeaderCell>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {myScore ? stickyRow : <></>}
                            {(page.length ? page : rows).map((row, index) => {
                                prepareRow(row);
                                const isTopTen = index < 10;
                                return (
                                    <TableRow
                                        {...row.getRowProps()}
                                        key={index}
                                        topTen={isTopTen}
                                        hideBorder={index === page.length - 1}
                                    >
                                        {row.cells.map((cell, cellIndex) => {
                                            return (
                                                <TableRowCell {...cell.getCellProps()} key={cellIndex}>
                                                    {cell.render('Cell')}
                                                </TableRowCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </tbody>
                    </Table>
                )}
                {filteredData?.length > 0 && (
                    <PaginationWrapper
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        count={filteredData?.length ? filteredData.length : 0}
                        labelRowsPerPage={t(`common.pagination.rows-per-page`)}
                        rowsPerPage={state.pageSize}
                        page={state.pageIndex}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                )}
            </TableContainer>
        </Container>
    );
};

const Container = styled.div`
    flex: 8;
`;

export default TableByGuessedCorrectly;
