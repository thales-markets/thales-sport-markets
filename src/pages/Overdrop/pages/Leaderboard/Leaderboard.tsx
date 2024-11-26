import SPAAnchor from 'components/SPAAnchor';
import Table from 'components/Table';
import { TableCell, TableRow, TableRowMobile } from 'components/Table/Table';
import { t } from 'i18next';
import SearchField from 'pages/Profile/components/SearchField';
import useOverdropLeaderboardQuery from 'queries/overdrop/useOverdropLeaderboardQuery';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { useTheme } from 'styled-components';
import { formatCurrency, getEtherscanAddressLink, truncateAddress } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { getCurrentLevelByPoints } from 'utils/overdrop';
import { useAccount, useChainId } from 'wagmi';
import {
    AddressContainer,
    Badge,
    Disclaimer,
    HeaderContainer,
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
    const isMobile = useSelector(getIsMobile);

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const { address } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const theme: ThemeInterface = useTheme();

    const [searchText, setSearchText] = useState<string>('');

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
                            <div>{' + '}</div>
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

    const columns = [
        {
            accessorKey: 'level.smallBadge',
            enableSorting: false,
            cell: (cellProps: any) => {
                return <Badge style={{ width: '45px' }} src={cellProps.cell.getValue()} />;
            },
            size: 50,
        },
        {
            header: <>{t('overdrop.leaderboard.table.address')}</>,
            accessorKey: 'address',
            enableSorting: false,
            cell: (cellProps: any) => {
                return (
                    <>
                        <AddressContainer>
                            <SPAAnchor href={getEtherscanAddressLink(networkId, cellProps.cell.getValue())}>
                                {truncateAddress(cellProps.cell.getValue())}
                            </SPAAnchor>
                        </AddressContainer>
                    </>
                );
            },
        },
        {
            header: <>{t('overdrop.leaderboard.table.rank')}</>,
            accessorKey: 'rank',
            enableSorting: true,
            cell: (cellProps: any) => {
                return <div>#{cellProps.cell.getValue()}</div>;
            },
            width: '50px',
            maxWidth: 50,
        },
        {
            header: <>{t('overdrop.leaderboard.table.level')}</>,
            accessorKey: 'level',
            enableSorting: true,
            cell: (cellProps: any) => {
                return (
                    <div>
                        #{cellProps.cell.getValue().level} {cellProps.cell.getValue().levelName}
                    </div>
                );
            },
            sortInverted: true,
        },
        {
            header: <>{t('overdrop.leaderboard.table.total-xp')}</>,
            accessorKey: 'points',
            cell: (cellProps: any) => {
                return <div>{formatCurrency(cellProps.cell.getValue())}</div>;
            },
            enableSorting: true,
            sortDescFirst: true,
        },
        {
            header: <>{t('overdrop.leaderboard.table.total-volume')}</>,
            accessorKey: 'volume',
            enableSorting: true,
            cell: (cellProps: any) => {
                return <div>{formatCurrency(cellProps.cell.getValue())}</div>;
            },
            sortDescFirst: true,
        },
        {
            header: <>{t('overdrop.leaderboard.table.rewards')}</>,
            accessorKey: 'rewards',
            enableSorting: true,
            cell: (cellProps: any) => {
                return (
                    <>
                        <div>{formatCurrency(cellProps.cell.getValue().op)} OP</div>
                        {isMobile ? <div>{' + '}</div> : <></>}
                        <div>{formatCurrency(cellProps.cell.getValue().arb)} ARB</div>
                    </>
                );
            },
            sortInverted: true,
            sortDescFirst: true,
        },
    ];

    return (
        <TableContainer>
            <HeaderContainer>
                <Disclaimer>{t('overdrop.overdrop-home.disclaimer')}</Disclaimer>
                <SearchFieldContainer>
                    <SearchField
                        customPlaceholder={t('profile.search-field')}
                        text={searchText}
                        handleChange={(value) => setSearchText(value)}
                    />
                </SearchFieldContainer>
            </HeaderContainer>
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
                columns={columns as any}
                initialState={{
                    sortBy: [
                        {
                            id: 'rank',
                            desc: false,
                        },
                    ],
                }}
                isLoading={leaderboardQuery.isLoading}
                data={leaderboardFiltered}
                noResultsMessage={t('market.table.no-results')}
            ></Table>
        </TableContainer>
    );
};

export default Leaderboard;
