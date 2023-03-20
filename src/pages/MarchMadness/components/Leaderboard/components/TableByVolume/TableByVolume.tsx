import Tooltip from 'components/Tooltip';
import { PaginationWrapper } from 'pages/Quiz/styled-components';
import useLeaderboardByVolumeQuery, { LeaderboardByVolumeData } from 'queries/marchMadness/useLeaderboardByVolumeQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Column, useTable, usePagination } from 'react-table';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { getDefaultColleteralForNetwork } from 'utils/collaterals';
import { getEtherscanAddressLink } from 'utils/etherscan';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import {
    Arrow,
    Container,
    NoDataContainer,
    NoDataLabel,
    OverlayContainer,
    StickyRow,
    Table,
    TableContainer,
    TableHeader,
    TableHeaderCell,
    TableHeaderContainer,
    TableRow,
    TableRowCell,
} from './styled-components';

export const TooltipStyle = { backgroundColor: '#021631', border: '1px solid #005EB8' };

type TableByVolumeProps = {
    searchText: string;
};

const TableByVolume: React.FC<TableByVolumeProps> = ({ searchText }) => {
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
                Header: <>{t('march-madness.leaderboard.volume')}</>,
                accessor: 'volume',
                Cell: (cellProps) => (
                    <>{formatCurrencyWithKey(getDefaultColleteralForNetwork(networkId), cellProps.cell.value, 2)}</>
                ),
            },
            {
                Header: () => (
                    <>
                        {t('march-madness.leaderboard.base-volume')}
                        <Tooltip
                            overlayInnerStyle={TooltipStyle}
                            overlay={
                                <OverlayContainer>
                                    {t('march-madness.leaderboard.tooltip-base-volume-table')}
                                </OverlayContainer>
                            }
                            iconFontSize={14}
                            marginLeft={2}
                            top={0}
                        />
                    </>
                ),
                accessor: 'baseVolume',
                Cell: (cellProps) => (
                    <>{formatCurrencyWithKey(getDefaultColleteralForNetwork(networkId), cellProps.cell.value, 2)}</>
                ),
            },
            {
                Header: () => (
                    <>
                        {t('march-madness.leaderboard.bonus-volume')}
                        <Tooltip
                            overlayInnerStyle={TooltipStyle}
                            overlay={
                                <OverlayContainer>
                                    {t('march-madness.leaderboard.tooltip-bonus-volume-table')}
                                </OverlayContainer>
                            }
                            iconFontSize={14}
                            marginLeft={2}
                            top={0}
                        />
                    </>
                ),
                accessor: 'bonusVolume',
                Cell: (cellProps) => (
                    <>{formatCurrencyWithKey(getDefaultColleteralForNetwork(networkId), cellProps.cell.value, 2)}</>
                ),
            },
            {
                Header: () => (
                    <>
                        {t('march-madness.leaderboard.rewards')}
                        <Tooltip
                            overlayInnerStyle={TooltipStyle}
                            overlay={
                                <OverlayContainer>
                                    {t('march-madness.leaderboard.tooltip-rewards-volume-table')}
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
    }, [networkId, t]);

    const leaderboardQuery = useLeaderboardByVolumeQuery(networkId);

    const data = useMemo(() => {
        if (leaderboardQuery.isSuccess && leaderboardQuery.data) return leaderboardQuery.data?.leaderboard;
        return [];
    }, [leaderboardQuery.data, leaderboardQuery.isSuccess]);

    const myScore = useMemo(() => {
        if (data) {
            return data.filter((user) => user.walletAddress.toLowerCase() == walletAddress?.toLowerCase());
        }
        return [];
    }, [data, walletAddress]);

    const filteredData = useMemo(() => {
        if (data) {
            let finalData: LeaderboardByVolumeData = [];

            finalData = data;

            const myScore = data.filter((user) => user.walletAddress.toLowerCase() == walletAddress?.toLowerCase());
            if (myScore.length) {
                finalData = data.filter((user) => user.walletAddress.toLowerCase() !== walletAddress?.toLowerCase());
            }

            if (searchText.trim() !== '') {
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
                <StickyRow myScore={true}>
                    <TableRowCell>{myScore[0].rank}</TableRowCell>
                    <TableRowCell>{t('march-madness.leaderboard.my-rewards').toUpperCase()}</TableRowCell>
                    <TableRowCell>
                        {formatCurrencyWithKey(getDefaultColleteralForNetwork(networkId), myScore[0].volume, 2)}
                    </TableRowCell>
                    <TableRowCell>
                        {formatCurrencyWithKey(getDefaultColleteralForNetwork(networkId), myScore[0].baseVolume, 2)}
                    </TableRowCell>
                    <TableRowCell>
                        {formatCurrencyWithKey(getDefaultColleteralForNetwork(networkId), myScore[0].bonusVolume, 2)}
                    </TableRowCell>
                    <TableRowCell>{myScore[0].rewards}</TableRowCell>
                </StickyRow>
            );
        }
    }, [myScore, networkId, t]);

    return (
        <Container>
            <TableHeaderContainer hideBottomBorder={true}>
                <TableHeader>{'By volume'}</TableHeader>
            </TableHeaderContainer>
            <TableContainer>
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
                                return (
                                    <TableRow {...row.getRowProps()} key={index} hideBorder={index === page.length - 1}>
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

export default TableByVolume;
