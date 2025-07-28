import OutsideClickHandler from 'components/OutsideClick';
import SPAAnchor from 'components/SPAAnchor';
import Table from 'components/Table';
import { TableCell, TableRow, TableRowMobile } from 'components/Table/Table';
import { MONTH_NAMES } from 'constants/general';
import { OVERDROP_SEASONS, SEASON_2 } from 'constants/overdrop';
import { t } from 'i18next';
import SearchField from 'pages/Profile/components/SearchField';
import useOverdropLeaderboardQuery from 'queries/overdrop/useOverdropLeaderboardQuery';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { useTheme } from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { formatCurrency, getEtherscanAddressLink, truncateAddress } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import { getCurrentLevelByPoints } from 'utils/overdrop';
import { useAccount, useChainId } from 'wagmi';
import {
    AddressContainer,
    Badge,
    Disclaimer,
    DropDown,
    DropdownButton,
    DropdownContainer,
    DropDownItem,
    HeaderContainer,
    MonthButton,
    MonthsContainer,
    MonthsInnerContainer,
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
    const isMobile = useSelector(getIsMobile);

    const networkId = useChainId();
    const { address } = useAccount();

    const theme: ThemeInterface = useTheme();

    const [searchText, setSearchText] = useState<string>('');
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [selectedMiniSeason, setSelectedMiniSeason] = useState<number>(0);
    const [selectSeasonOpen, setSelectSeasonOpen] = useState<boolean>(false);

    const leaderboardQuery = useOverdropLeaderboardQuery(selectedSeason, selectedMiniSeason + 1);

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
        const data = leaderboard.find((row) => row.address.toLowerCase() == address?.toLowerCase());
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
                        {selectedSeason === 1 ? (
                            <>
                                <div>{formatCurrency(data.rewards.op)} OP</div>
                                <div>{formatCurrency(data.rewards.arb)} ARB</div>
                            </>
                        ) : (
                            <>
                                <div>{formatCurrency(data.rewards.eth, 4)} ETH</div>
                            </>
                        )}
                    </StickyCell>
                </StickyContainer>
            </StickyRow>
        );
    }, [isMobile, leaderboard, networkId, address, selectedSeason]);

    const columns = [
        {
            header: '',
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
            size: 50,
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
                const hasEth = !!cellProps.cell.getValue().eth;
                return (
                    <>
                        {!hasEth ? (
                            <>
                                <div>{formatCurrency(cellProps.cell.getValue().op)} OP</div>
                                {isMobile ? <div>{' + '}</div> : <></>}
                                <div>{formatCurrency(cellProps.cell.getValue().arb)} ARB</div>
                            </>
                        ) : (
                            <>
                                <div>{formatCurrency(cellProps.cell.getValue().eth, 4)} ETH</div>
                            </>
                        )}
                    </>
                );
            },
            sortInverted: true,
            sortDescFirst: true,
        },
    ];

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return (
        <TableContainer>
            <Disclaimer>{t('overdrop.overdrop-home.disclaimer')}</Disclaimer>
            <HeaderContainer>
                <DropdownButton
                    onClick={() => {
                        setSelectSeasonOpen(!selectSeasonOpen);
                    }}
                >
                    <span>Season {selectedSeason}</span>
                    <i className="icon icon--caret-down" />
                </DropdownButton>
                {selectSeasonOpen && (
                    <OutsideClickHandler onOutsideClick={() => setSelectSeasonOpen(false)}>
                        <DropdownContainer>
                            <DropDown>
                                {OVERDROP_SEASONS.map((item: number) => {
                                    return (
                                        <DropDownItem
                                            key={item}
                                            isSelected={selectedSeason === item}
                                            onClick={() => {
                                                setSelectedSeason(item);
                                                setSelectSeasonOpen(false);
                                            }}
                                        >
                                            <FlexDivCentered>
                                                <span>Season {item}</span>
                                            </FlexDivCentered>
                                        </DropDownItem>
                                    );
                                })}
                            </DropDown>
                        </DropdownContainer>
                    </OutsideClickHandler>
                )}
                <SearchFieldContainer>
                    <SearchField
                        customPlaceholder={t('profile.search-field')}
                        text={searchText}
                        handleChange={(value) => setSearchText(value)}
                    />
                </SearchFieldContainer>
            </HeaderContainer>

            <MonthsContainer visible={selectedSeason === 2}>
                {selectedSeason === 2 && (
                    <MonthsInnerContainer>
                        {SEASON_2.map(({ month, year }, index) => {
                            const isFuture = year > currentYear || (year === currentYear && month > currentMonth);
                            const monthName = MONTH_NAMES[month - 1];

                            return (
                                <MonthButton
                                    key={index}
                                    disabled={isFuture}
                                    selected={selectedMiniSeason === index}
                                    onClick={() => {
                                        if (isFuture) return;
                                        setSelectedMiniSeason(index);
                                    }}
                                >
                                    {monthName}
                                </MonthButton>
                            );
                        })}
                    </MonthsInnerContainer>
                )}
            </MonthsContainer>

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
                rowsPerPage={20}
                initialState={{
                    sorting: [
                        {
                            id: 'rank',
                            desc: false,
                        },
                    ],
                }}
                isLoading={leaderboardQuery.isLoading}
                data={leaderboardFiltered}
                noResultsMessage={t('market.table.no-results')}
                showPagination
            ></Table>
        </TableContainer>
    );
};

export default Leaderboard;
