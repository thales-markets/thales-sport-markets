import styled from 'styled-components';
import React, { useMemo } from 'react';
import { Column, usePagination, useTable } from 'react-table';
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
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useSelector } from 'react-redux';
import { truncateAddress } from 'utils/formatters/string';
import useLoeaderboardByGuessedCorrectlyQuery, {
    LeaderboardByGuessedCorrectlyResponse,
} from 'queries/marchMadness/useLoeaderboardByGuessedCorrectlyQuery';
import { useTranslation } from 'react-i18next';
import Tooltip from 'components/Tooltip';
import { TooltipStyle } from '../TableByVolume/TableByVolume';
import { getEtherscanAddressLink } from 'utils/etherscan';

type TableByGuessedCorrectlyProps = {
    searchText: string;
};

const TableByGuessedCorrectly: React.FC<TableByGuessedCorrectlyProps> = ({ searchText }) => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));

    const columns: Column[] = useMemo(() => {
        return [
            {
                Header: '',
                accessor: 'rank',
            },
            {
                Header: <>{t('march-madness.leaderboard.address')}</>,
                accessor: 'walletAddress',
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
                            overlayInnerStyle={TooltipStyle}
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
                accessor: 'totalCorrectedPredictions',
            },
            {
                Header: () => (
                    <>
                        {t('march-madness.leaderboard.rewards')}
                        <Tooltip
                            overlayInnerStyle={TooltipStyle}
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
    }, [t, networkId]);

    const leaderboardQuery = useLoeaderboardByGuessedCorrectlyQuery(networkId);

    const data = useMemo(() => {
        if (leaderboardQuery.isSuccess && leaderboardQuery.data) return leaderboardQuery.data;
        return [];
    }, [leaderboardQuery.data, leaderboardQuery.isSuccess]);

    const myScore = useMemo(() => {
        if (data) {
            return data.filter((user) => user.walletAddress.toLowerCase() == walletAddress?.toLowerCase());
        }
        return [];
    }, [data, walletAddress]);

    const filteredData = useMemo(() => {
        let finalData: LeaderboardByGuessedCorrectlyResponse = [];
        if (data) {
            finalData = data;
            const myScore = data.filter((user) => user.walletAddress.toLowerCase() == walletAddress?.toLowerCase());
            if (myScore.length) {
                finalData = data.filter((user) => user.walletAddress.toLowerCase() !== walletAddress?.toLowerCase());
            }

            if (searchText?.trim() !== '') {
                finalData = data.filter((user) => user.walletAddress.toLowerCase().includes(searchText.toLowerCase()));
            }

            return finalData;
        }

        return [];
    }, [data, searchText, walletAddress]);

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
                    <TableRowCell>{t('march-madness.leaderboard.my-rewards').toUpperCase()}</TableRowCell>
                    <TableRowCell>{myScore[0].totalCorrectedPredictions}</TableRowCell>
                    <TableRowCell>{myScore[0].rewards}</TableRowCell>
                </StickyRowTopTable>
            );
        }
    }, [myScore, t]);

    return (
        <Container>
            <TableHeaderContainer hideBottomBorder={true} inverseBorderGradient={true}>
                <TableHeader>{t('march-madness.leaderboard.by-guessed-correctly')}</TableHeader>
            </TableHeaderContainer>
            <TableContainer inverseBorderGradient={true}>
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
                                const isTopTen =
                                    state.pageIndex === 0 &&
                                    (myScore.length && myScore[0].rank <= 10 ? index < 9 : index < 10);
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
    width: 40%;
    padding-left: 10px;
`;

export default TableByGuessedCorrectly;
