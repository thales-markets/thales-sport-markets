import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { truncateAddress } from 'utils/formatters/string';
import { ReactComponent as ArrowRight } from 'assets/images/favorite-team/arrow-right.svg';
import { ReactComponent as LeaderboardRectangle } from 'assets/images/favorite-team/rewards-rectangle.svg';
import { countries } from 'pages/MintWorldCupNFT/countries';
import { InfoContainer, InfoText, InfoContent } from 'pages/MintWorldCupNFT/styled-components';
import { FlexDivCentered } from 'styles/common';
import Table from 'components/Table';
import useZebroQuery, { User } from 'queries/favoriteTeam/useZebroQuery';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getNetworkId } from 'redux/modules/wallet';
import { getIsMobile } from 'redux/modules/app';
import { TablePagination } from '@material-ui/core';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { USD_SIGN } from 'constants/currency';
import { CellProps } from 'react-table';

type LeaderboardProps = {
    favoriteTeamNumber: number | undefined;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ favoriteTeamNumber }) => {
    const { t } = useTranslation();
    const favoriteTeam = favoriteTeamNumber ? countries[favoriteTeamNumber - 1] : null;
    const isMobile = useSelector(getIsMobile);
    const [searchValue, setSearchValue] = useState('');
    console.log(favoriteTeam);
    const networkId = useSelector((state: RootState) => getNetworkId(state));
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
                columns={[
                    {
                        Header: <>{t('mint-world-cup-nft.leaderboard.nft')}</>,
                        accessor: 'url',
                        Cell: (cellProps: any) => <ZebroNft src={cellProps.cell.value} />,
                    },
                    {
                        Header: <>{t('mint-world-cup-nft.leaderboard.owner')}</>,
                        accessor: 'address',
                        Cell: (cellProps: any) => <TableText>{truncateAddress(cellProps.cell.value)}</TableText>,
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
                ]}
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
            />
            <PaginationContainer>
                <PaginationWrapper
                    rowsPerPageOptions={[5, 10, 20, 50, 100]}
                    count={filteredZebros.length ? filteredZebros.length : 0}
                    labelRowsPerPage={t(`common.pagination.rows-per-page`)}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </PaginationContainer>
        </>
    );
};

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
`;

const rewardsSort = () => (rowA: any, rowB: any) => {
    return rowA.original.rewards.op - rowB.original.rewards.op;
};

export default Leaderboard;
