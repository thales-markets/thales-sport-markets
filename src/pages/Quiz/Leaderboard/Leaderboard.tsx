import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BackToLink from 'pages/Markets/components/BackToLink';
import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import Table from 'components/Table';
import { CellProps } from 'react-table';
import Search from 'components/Search';
import useQuizLeaderboardQuery from 'queries/quiz/useQuizLeaderboardQuery';
import { LeaderboardItem, LeaderboardList } from 'types/quiz';
import {
    LeaderboardContainer,
    Container,
    Description,
    LeaderboardTitleContainer,
    Link,
    TwitterImage,
    TwitterTableContainer,
    PaginationWrapper,
    LeaderboardIcon,
} from '../styled-components';
import { getTwitterProfileLink } from 'utils/quiz';
import { formatCurrency, formatCurrencyWithKey } from 'utils/formatters/number';
import { CURRENCY_MAP } from 'constants/currency';
import { truncateAddress } from 'utils/formatters/string';

const Leaderboard: React.FC = () => {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState<string>('');

    const quizLeaderboardQuery = useQuizLeaderboardQuery();

    const leaderboard: LeaderboardList = useMemo(() => {
        if (quizLeaderboardQuery.isSuccess && quizLeaderboardQuery.data) {
            if (searchText.trim() !== '') {
                const data = quizLeaderboardQuery.data.filter(
                    (item: LeaderboardItem) =>
                        item.wallet.toLowerCase().includes(searchText.toLowerCase()) ||
                        item.name.toLowerCase().includes(searchText.toLowerCase())
                );

                return data;
            }
            return quizLeaderboardQuery.data;
        }

        return [];
    }, [quizLeaderboardQuery.data, quizLeaderboardQuery.isSuccess, searchText]);

    const [page, setPage] = useState(0);
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const [rowsPerPage, setRowsPerPage] = useState(20);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    useEffect(() => setPage(0), [searchText]);

    return (
        <>
            <BackToLink link={buildHref(ROUTES.Quiz)} text={t('quiz.leaderboard.back-to-quiz')} />
            <Container>
                <LeaderboardContainer>
                    <LeaderboardTitleContainer>
                        <LeaderboardIcon />
                        {t('quiz.leaderboard.title')}
                    </LeaderboardTitleContainer>
                    <Description>
                        <Trans i18nKey={t('quiz.leaderboard.description')} />
                    </Description>
                    <Search
                        text={searchText}
                        customPlaceholder={t('quiz.leaderboard.search-placeholder')}
                        handleChange={(e) => setSearchText(e)}
                        customStyle={{ border: '1px solid #1A1C2B' }}
                        width={300}
                        marginBottom={10}
                    />
                    <Table
                        tableRowStyles={{
                            fontSize: 16,
                            minHeight: 48,
                            borderBottom: '2px dotted rgba(255, 255, 255, 0.3)',
                        }}
                        tableRowHeadStyles={{ borderBottom: '2px solid rgba(255, 255, 255, 0.3)', color: '#5F6180' }}
                        columns={[
                            {
                                Header: <>{t('quiz.leaderboard.table.rank-col')}</>,
                                accessor: 'rank',
                                Cell: (cellProps: CellProps<LeaderboardItem, LeaderboardItem['rank']>) => (
                                    <p>{cellProps.cell.value}</p>
                                ),
                                sortable: true,
                                width: '100px',
                            },
                            {
                                Header: <>{t('quiz.leaderboard.table.twitter-col')}</>,
                                accessor: 'name',
                                Cell: (cellProps: CellProps<LeaderboardItem, LeaderboardItem['name']>) => (
                                    <Link
                                        href={getTwitterProfileLink(cellProps.cell.value)}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <TwitterTableContainer>
                                            <TwitterImage
                                                alt="twiiter"
                                                src={
                                                    cellProps.cell.row.original.avatar != ''
                                                        ? cellProps.cell.row.original.avatar
                                                        : 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
                                                }
                                            />
                                            {cellProps.cell.value}
                                        </TwitterTableContainer>
                                    </Link>
                                ),
                                sortable: true,
                                sortType: twitterSort(),
                                width: 'initial',
                            },
                            {
                                Header: <>{t('quiz.leaderboard.table.wallet-address-col')}</>,
                                accessor: 'wallet',
                                Cell: (cellProps: CellProps<LeaderboardItem, LeaderboardItem['wallet']>) => (
                                    <p>{truncateAddress(cellProps.cell.value, 5)}</p>
                                ),
                                sortable: false,
                                width: 'initial',
                            },
                            {
                                Header: <>{t('quiz.leaderboard.table.points-col')}</>,
                                accessor: 'points',
                                Cell: (cellProps: CellProps<LeaderboardItem, LeaderboardItem['points']>) => (
                                    <p>{cellProps.cell.value}</p>
                                ),
                                sortable: true,
                                width: 'initial',
                            },
                            {
                                Header: <>{t('quiz.leaderboard.table.time-col')}</>,
                                accessor: 'finishTime',
                                Cell: (cellProps: CellProps<LeaderboardItem, LeaderboardItem['finishTime']>) => (
                                    <p>{`${formatCurrency(cellProps.cell.value)}`}</p>
                                ),
                                sortable: true,
                                width: 'initial',
                            },
                            {
                                Header: <>{t('quiz.leaderboard.table.rewards-col')}</>,
                                accessor: 'rewards',
                                Cell: (cellProps: CellProps<LeaderboardItem, LeaderboardItem['rewards']>) => (
                                    <p>
                                        {cellProps.cell.value
                                            ? `${formatCurrencyWithKey(
                                                  CURRENCY_MAP.THALES,
                                                  cellProps.cell.value,
                                                  0,
                                                  true
                                              )}`
                                            : ''}
                                    </p>
                                ),
                                sortable: true,
                                width: 'initial',
                            },
                        ]}
                        initialState={{
                            sortBy: [
                                {
                                    id: 'rank',
                                    desc: false,
                                },
                            ],
                            pageIndex: 0,
                        }}
                        data={leaderboard}
                        isLoading={quizLeaderboardQuery.isLoading}
                        noResultsMessage={t('quiz.leaderboard.table.no-data-available')}
                        onSortByChanged={() => setPage(0)}
                        currentPage={page}
                        rowsPerPage={rowsPerPage}
                    />
                </LeaderboardContainer>
                <PaginationWrapper
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    count={leaderboard.length ? leaderboard.length : 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Container>
        </>
    );
};

const twitterSort = () => (rowA: any, rowB: any) => {
    return rowA.original.name.trim().localeCompare(rowB.original.name.trim());
};

export default Leaderboard;
