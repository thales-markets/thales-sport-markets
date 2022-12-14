import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { truncateAddress } from 'utils/formatters/string';
import { ReactComponent as ArrowRight } from 'assets/images/favorite-team/arrow-right.svg';
import { ReactComponent as LeaderboardRectangle } from 'assets/images/favorite-team/rewards-rectangle.svg';
import { InfoContainer, InfoText, InfoContent } from 'pages/MintWorldCupNFT/styled-components';
import { FlexDivCentered, FlexDivColumn } from 'styles/common';
import Table from 'components/Table';
import useZebroQuery, { User } from 'queries/favoriteTeam/useZebroQuery';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { getIsMobile } from 'redux/modules/app';
import { TablePagination } from '@material-ui/core';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { USD_SIGN } from 'constants/currency';
import { CellProps } from 'react-table';
import Tooltip from 'components/Tooltip';
import { ReactComponent as GroupRectangle } from 'assets/images/favorite-team/group-collapsed-rectangle.svg';

const Leaderboard: React.FC = () => {
    const { t } = useTranslation();

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isMobile = useSelector(getIsMobile);

    const [searchValue, setSearchValue] = useState('');

    const zebrosQuery = useZebroQuery(networkId);

    const [page, setPage] = useState(0);
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const [rowsPerPage, setRowsPerPage] = useState(20);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    const filteredZebros = useMemo(() => {
        const leaderboard = zebrosQuery.isSuccess ? zebrosQuery.data.leaderboard : [];
        return leaderboard.filter((user) => user.address.toLowerCase().includes(searchValue.toLowerCase()));
    }, [zebrosQuery.isSuccess, zebrosQuery.data?.leaderboard, searchValue]);

    const stickyRow = useMemo(() => {
        const leaderboard = zebrosQuery.isSuccess ? zebrosQuery.data.leaderboard : [];
        const user = leaderboard.filter((user) => user.address.toLowerCase().includes(walletAddress.toLowerCase()))[0];
        if (user) {
            return (
                <StickyRowWrapper>
                    {!isMobile && <GroupRectangleHeight />}
                    <FlexWrapper>
                        <div>
                            <TableText style={{ marginRight: 6 }}>{user.rank}</TableText>
                            <Tooltip
                                overlay={<OverlayContainer>{extractCountryName(user.url)}</OverlayContainer>}
                                component={<ZebroNft src={user.url} />}
                                iconFontSize={23}
                                marginLeft={2}
                                top={0}
                            />
                        </div>
                        <div>
                            <TableText>{truncateAddress(user.address, isMobile ? 3 : 5, isMobile ? 3 : 5)}</TableText>
                        </div>
                        <div>
                            <TableText>{formatCurrencyWithSign(USD_SIGN, user.volume, 2)}</TableText>
                        </div>
                        <div>
                            <TableText>{formatCurrencyWithSign(USD_SIGN, user.baseVolume, 2)}</TableText>
                        </div>
                        <div>
                            <TableText>{formatCurrencyWithSign(USD_SIGN, user.bonusVolume, 2)}</TableText>
                        </div>
                        <div>
                            <TableText>{`${Number(user.rewards?.op).toFixed(2)} OP + ${Number(
                                user.rewards?.thales
                            ).toFixed(2)} THALES`}</TableText>
                        </div>
                    </FlexWrapper>
                </StickyRowWrapper>
            );
        }
    }, [zebrosQuery.isSuccess, zebrosQuery.data?.leaderboard, walletAddress, isMobile]);

    const columns = [
        {
            Header: <>{t('mint-world-cup-nft.leaderboard.nft')}</>,
            accessor: 'url',
            Cell: (cellProps: any) => (
                <Tooltip
                    overlay={<OverlayContainer>{extractCountryName(cellProps.cell.value)}</OverlayContainer>}
                    component={
                        <>
                            <TableText style={{ marginRight: 6 }}>{cellProps.row.original.rank}</TableText>
                            <ZebroNft src={cellProps.cell.value} />
                        </>
                    }
                    iconFontSize={23}
                    marginLeft={2}
                    top={0}
                />
            ),
        },
        {
            Header: <>{t('mint-world-cup-nft.leaderboard.owner')}</>,
            accessor: 'address',
            Cell: (cellProps: any) => (
                <TableText>{truncateAddress(cellProps.cell.value, isMobile ? 3 : 5, isMobile ? 3 : 5)}</TableText>
            ),
        },
        {
            Header: <>{t('mint-world-cup-nft.leaderboard.volume')}</>,
            accessor: 'volume',
            Cell: (cellProps: any) => (
                <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>
            ),
        },
        {
            Header: <>{t('mint-world-cup-nft.leaderboard.base-volume')}</>,
            accessor: 'baseVolume',
            Cell: (cellProps: any) => (
                <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>
            ),
            isVisible: !isMobile,
        },
        {
            Header: <>{t('mint-world-cup-nft.leaderboard.bonus-volume')}</>,
            accessor: 'bonusVolume',
            Cell: (cellProps: any) => (
                <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>
            ),
        },
        {
            Header: <>{t('mint-world-cup-nft.leaderboard.rewards')}</>,
            accessor: 'rewards',
            Cell: (cellProps: CellProps<User, User['rewards']>) => (
                <TableText>{`${Number(cellProps.cell.value?.op).toFixed(2)} OP + ${Number(
                    cellProps.cell.value?.thales
                ).toFixed(2)} THALES`}</TableText>
            ),
            sortType: rewardsSort(),
            sortable: true,
        },
    ].filter((column) => column.isVisible === undefined || column.isVisible);

    return (
        <>
            <InfoContainer>
                {!isMobile && <LeaderboardRectangle />}
                <InfoContent isMobile={isMobile}>
                    <InfoText isMobile={isMobile}>{t('mint-world-cup-nft.leaderboard.reward-calculations')}</InfoText>
                    <ListItemContainer>
                        <ArrowRight />
                        <ListItem>
                            <span>{t('mint-world-cup-nft.leaderboard.home-country-multiplier')}</span>{' '}
                            {t('mint-world-cup-nft.leaderboard.home-country-multiplier-text')}
                        </ListItem>
                    </ListItemContainer>
                    <ListItemContainer>
                        <ArrowRight />
                        <ListItem>
                            <span>{t('mint-world-cup-nft.leaderboard.parlay-boost')}</span>{' '}
                            {t('mint-world-cup-nft.leaderboard.parlay-boost-text')}
                        </ListItem>
                    </ListItemContainer>
                    <ListItemContainer style={{ marginTop: '5px' }}>
                        <ListItem>
                            <ListItemContainer>
                                <ArrowRight />
                                <ListItem>{t('mint-world-cup-nft.leaderboard.two-game-parlay')}</ListItem>
                            </ListItemContainer>
                            <ListItemContainer>
                                <ArrowRight />
                                <ListItem>{t('mint-world-cup-nft.leaderboard.three-game-parlay')}</ListItem>
                            </ListItemContainer>
                            <ListItemContainer>
                                <ArrowRight />
                                <ListItem>{t('mint-world-cup-nft.leaderboard.four-game-parlay')}</ListItem>
                            </ListItemContainer>
                        </ListItem>
                    </ListItemContainer>
                    <ListItemContainer>
                        <ArrowRight />
                        <ListItem>
                            <span>{t('mint-world-cup-nft.leaderboard.underdog-multiplier')}</span>{' '}
                            {t('mint-world-cup-nft.leaderboard.underdog-multiplier-text')}
                        </ListItem>
                    </ListItemContainer>
                    <ListItemContainer>
                        <ListItem>
                            <Warning>{t('mint-world-cup-nft.leaderboard.wash-trading')}</Warning>
                        </ListItem>
                    </ListItemContainer>
                </InfoContent>
            </InfoContainer>
            <FlexDivCentered>
                <SearchAddress
                    onChange={(event) => setSearchValue(event.target.value)}
                    value={searchValue}
                    placeholder={t('mint-world-cup-nft.leaderboard.search-placeholder')}
                />
            </FlexDivCentered>
            <Table
                tableHeadCellStyles={{ justifyContent: 'center' }}
                tableRowHeadStyles={{
                    borderBottom: '2px solid rgba(238, 238, 228, 0.8)',
                    color: 'rgba(238, 238, 228, 0.8)',
                }}
                tableRowStyles={{
                    borderBottom: '1px dashed rgba(238, 238, 228, 0.8)',
                    paddingTop: 6,
                    paddingBottom: 6,
                }}
                tableRowCellStyles={{
                    justifyContent: 'center',
                }}
                columns={columns}
                columnsDeps={[columns.length]}
                rowsPerPage={rowsPerPage}
                currentPage={page}
                data={filteredZebros}
                initialState={{
                    sortBy: [
                        {
                            id: 'rewards',
                            desc: true,
                        },
                    ],
                }}
                stickyRow={stickyRow}
            />
            <PaginationContainer>
                <table>
                    <tbody>
                        <tr>
                            <PaginationWrapper
                                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                count={filteredZebros.length ? filteredZebros.length : 0}
                                labelRowsPerPage={t(`common.pagination.rows-per-page`)}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </tr>
                    </tbody>
                </table>
            </PaginationContainer>
        </>
    );
};

const StickyRowWrapper = styled.div`
    padding: 10px 0;
`;

const Warning = styled.p`
    text-align: center;
    color: #ffcc00;
    font-style: italic;
    font-family: 'Roboto';
    font-size: 14px;
`;

const TableText = styled.p`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 600;
    font-size: 13px;
    line-height: 150%;
    text-align: center;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: #eeeee4;
    @media (max-width: 600px) {
        font-size: 10px;
    }
`;

const GroupRectangleHeight = styled(GroupRectangle)`
    max-height: 64px;
`;

const FlexWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: 25px;
    max-height: 64px;
    padding-right: 20px;
    width: 100%;
    & > div {
        display: flex;
        flex: 1;
        justify-content: center;
        align-items: center;
    }
    & > div:first-child {
        padding-left: 18px;
    }
    @media (max-width: 949px) {
        position: static;
        background: #009e92;
    }
`;

const ListItemContainer = styled.div`
    display: flex;
    margin-top: 15px;
    align-items: center;
    line-height: 20px;
`;

const ListItem = styled.span`
    margin-left: 10px;
    width: 90%;
    & > div {
        margin-left: 6%;
        margin-top: 2px;
    }
    & > span {
        font-weight: bold;
    }
`;

const ZebroNft = styled.img`
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 20px;
`;

const SearchAddress = styled.input`
    width: 90%;
    padding: 5px;
    margin: 20px 0;
    background: rgba(4, 207, 182, 0.4);
    border: 1px solid rgba(4, 207, 182, 0.8);
    text-align: center;
    color: white;
    z-index: 1;
    ::placeholder {
        text-align: center;
        color: rgba(238, 238, 228, 0.8);
    }
    ::-webkit-input-placeholder {
        text-align: center;
        color: rgba(238, 238, 228, 0.8);
    }
    :-moz-placeholder {
        /* Firefox 18- */
        text-align: center;
        color: rgba(238, 238, 228, 0.8);
    }
    ::-moz-placeholder {
        /* Firefox 19+ */
        text-align: center;
        color: rgba(238, 238, 228, 0.8);
    }
    :-ms-input-placeholder {
        text-align: center;
        color: rgba(238, 238, 228, 0.8);
    }
`;

const PaginationContainer = styled.div`
    display: flex;
    padding: 10px;
`;

const PaginationWrapper = styled(TablePagination)`
    border: none !important;
    display: flex;
    width: 100%;
    height: auto;
    color: #f6f6fe !important;
    .MuiToolbar-root {
        padding: 0;
        display: flex;
        .MuiSelect-icon {
            color: #f6f6fe;
        }
    }
    .MuiIconButton-root {
        @media (max-width: 767px) {
            padding: 5px;
        }
    }
    .MuiIconButton-root.Mui-disabled {
        color: rgba(238, 238, 228, 0.4);
    }
    .MuiTablePagination-toolbar > .MuiTablePagination-caption:last-of-type {
        display: block;
    }
    .MuiTablePagination-input {
        margin-top: 2px;
    }
    .MuiTablePagination-selectRoot {
        @media (max-width: 767px) {
            margin-left: 0px;
            margin-right: 0px;
        }
    }
    .MuiTablePagination-actions {
        @media (max-width: 767px) {
            margin-left: 10px;
        }
    }
    .MuiTablePagination-spacer {
        display: none;
    }
`;

export const OverlayContainer = styled(FlexDivColumn)`
    text-align: center;
    text-transform: uppercase;
`;

const rewardsSort = () => (rowA: any, rowB: any) => {
    return rowA.original.rewards.op - rowB.original.rewards.op;
};

const extractCountryName = (url: string) => {
    const countryRaw = url.split('zebro_')[1].split('.')[0];
    let country;
    if (countryRaw.includes('_')) {
        const countryNameArray = countryRaw.split('_');
        country = countryNameArray[0] + ' ' + countryNameArray[1];
    } else {
        country = countryRaw;
    }
    return country;
};

export default Leaderboard;
