import PaginationWrapper from 'components/PaginationWrapper';
import SPAAnchor from 'components/SPAAnchor';
import Table from 'components/Table';
import { TableCell, TableRow, TableRowMobile } from 'components/Table/Table';
import { t } from 'i18next';
import SearchField from 'pages/Profile/components/SearchField';
import useOverdropLeaderboardQuery from 'queries/overdrop/useOverdropLeaderboardQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useTheme } from 'styled-components';
import { FlexDiv } from 'styles/common';
import { formatCurrency, getEtherscanAddressLink, truncateAddress } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { getCurrentLevelByPoints } from 'utils/overdrop';
import {
    AddressContainer,
    Badge,
    SearchFieldContainer,
    StickyCell,
    StickyContainer,
    StickyRow,
    StickyRowCardContainer,
    TableContainer,
    tableHeaderStyle,
    tableRowStyle,
} from './styled-components';

const Leaderboard: React.FC = () => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isMobile = useSelector(getIsMobile);

    const theme: ThemeInterface = useTheme();

    const [page, setPage] = useState(0);
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };
    const [searchText, setSearchText] = useState<string>('');
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    const leaderboardQuery = useOverdropLeaderboardQuery({ enabled: isAppReady });

    const leaderboard = useMemo(
        () =>
            leaderboardQuery.isSuccess
                ? leaderboardQuery.data.map((row) => ({ ...row, level: getCurrentLevelByPoints(row.points) }))
                : [],
        [leaderboardQuery.isSuccess, leaderboardQuery.data]
    );

    const leaderboardFiltered = useMemo(
        () => leaderboard.filter((row) => row.address.toLowerCase().includes(searchText.toLowerCase())),
        [leaderboard, searchText]
    );

    useEffect(() => setPage(0), [leaderboard.length]);

    const stickyRow = useMemo(() => {
        const data = leaderboard.find((row) => row.address.toLowerCase() == walletAddress?.toLowerCase());
        if (!data) return undefined;
        return isMobile ? (
            <StickyRowCardContainer>
                <TableRow isCard role="row">
                    <TableRowMobile>
                        <TableCell id={'level.smallBadgeHeader'}></TableCell>
                        <TableCell id={'level.smallBadge'}>
                            <Badge style={{ width: '45px' }} src={data.level.smallBadge} />
                        </TableCell>
                    </TableRowMobile>
                    <TableRowMobile>
                        <TableCell id={'addressHeader'}>{t('overdrop.leaderboard.table.address')}</TableCell>
                        <TableCell isCard id={'address'}>
                            <AddressContainer>
                                <SPAAnchor href={getEtherscanAddressLink(networkId, data.address)}>
                                    {truncateAddress(data.address)}
                                </SPAAnchor>
                            </AddressContainer>
                        </TableCell>
                    </TableRowMobile>
                    <TableRowMobile>
                        <TableCell id={'rankHeader'}>{t('overdrop.leaderboard.table.rank')}</TableCell>
                        <TableCell isCard id={'rank'}>
                            <div>#{data.rank}</div>
                        </TableCell>
                    </TableRowMobile>
                    <TableRowMobile>
                        <TableCell id={'levelHeader'}>{t('overdrop.leaderboard.table.level')}</TableCell>
                        <TableCell isCard id={'level'}>
                            <div>
                                #{data.level.level} {data.level.levelName}
                            </div>
                        </TableCell>
                    </TableRowMobile>
                    <TableRowMobile>
                        <TableCell id={'pointsHeader'}>{t('overdrop.leaderboard.table.total-xp')}</TableCell>
                        <TableCell isCard id={'points'}>
                            <div>{formatCurrency(data.points)}</div>
                        </TableCell>
                    </TableRowMobile>
                    <TableRowMobile>
                        <TableCell id={'volumeHeader'}>{t('overdrop.leaderboard.table.total-volume')}</TableCell>
                        <TableCell isCard id={'volume'}>
                            <div>{formatCurrency(data.volume)}</div>
                        </TableCell>
                    </TableRowMobile>
                    <TableRowMobile>
                        <TableCell id={'rewardsHeader'}>{t('overdrop.leaderboard.table.rewards')}</TableCell>
                        <TableCell isCard id={'rewards'}>
                            <div>{formatCurrency(data.rewards.op)} OP</div>
                            <div>{formatCurrency(data.rewards.arb)} ARB</div>
                        </TableCell>
                    </TableRowMobile>
                </TableRow>
            </StickyRowCardContainer>
        ) : (
            <StickyRow>
                <StickyContainer>
                    <StickyCell width="50px">
                        <Badge src={data.level.smallBadge} />
                    </StickyCell>
                    <StickyCell>
                        <AddressContainer>
                            <SPAAnchor href={getEtherscanAddressLink(networkId, data.address)}>
                                {truncateAddress(data.address)}
                            </SPAAnchor>
                        </AddressContainer>
                    </StickyCell>
                    <StickyCell style={{ minWidth: '50px' }} width="50px">
                        #{data.rank}
                    </StickyCell>
                    <StickyCell>
                        #{data.level.level} {data.level.levelName}
                    </StickyCell>
                    <StickyCell>{formatCurrency(data.points)}</StickyCell>
                    <StickyCell>{formatCurrency(data.volume)}</StickyCell>
                    <StickyCell>
                        <div>{formatCurrency(data.rewards.op)} OP</div>
                        <div>{formatCurrency(data.rewards.arb)} ARB</div>
                    </StickyCell>
                </StickyContainer>
            </StickyRow>
        );
    }, [isMobile, leaderboard, networkId, walletAddress]);

    return (
        <TableContainer>
            <SearchFieldContainer>
                <SearchField
                    customPlaceholder={t('profile.search-field')}
                    text={searchText}
                    handleChange={(value) => setSearchText(value)}
                />
            </SearchFieldContainer>
            <Table
                mobileCards
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
                                    <AddressContainer>
                                        <SPAAnchor href={getEtherscanAddressLink(networkId, cellProps.cell.value)}>
                                            {truncateAddress(cellProps.cell.value)}
                                        </SPAAnchor>
                                    </AddressContainer>
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
                        sortInverted: true,
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
                                    <div>{formatCurrency(cellProps.cell.value.op)} OP</div>
                                    <div>{formatCurrency(cellProps.cell.value.arb)} ARB</div>
                                </>
                            );
                        },
                        sortInverted: true,
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
                data={leaderboardFiltered}
                noResultsMessage={t('market.table.no-results')}
            ></Table>
            {!leaderboardQuery.isLoading && leaderboard.length > 0 && (
                <FlexDiv>
                    <PaginationWrapper
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        count={leaderboardFiltered.length}
                        labelRowsPerPage={t(`common.pagination.rows-per-page`)}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </FlexDiv>
            )}
        </TableContainer>
    );
};

export default Leaderboard;
