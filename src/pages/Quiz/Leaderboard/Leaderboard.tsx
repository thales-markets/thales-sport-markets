import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BackToLink from 'pages/Markets/components/BackToLink';
import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import Table from 'components/Table';
import { CellProps } from 'react-table';
import { truncateAddress } from 'utils/formatters/string';
import Search from 'components/Search';
import useQuizLeaderboardQuery from 'queries/quiz/useQuizLeaderboardQuery';
import { LeaderboardItem, LeaderboardList } from 'types/quiz';
import {
    QuizContainer,
    Container,
    Description,
    Title,
    Link,
    TwitterImage,
    TwitterTableContainer,
} from '../styled-components';
import { getEtherscanAddressLink } from 'utils/etherscan';
import { NetworkIdByName } from 'utils/network';
import { getTwitterProfileLink } from 'utils/quiz';
import { formatCurrency } from 'utils/formatters/number';

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

    return (
        <>
            <BackToLink link={buildHref(ROUTES.Quiz)} text={t('quiz.leaderboard.back-to-quiz')} />
            <Container>
                <QuizContainer>
                    <Title>{t('quiz.leaderboard.title')}</Title>
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
                        columns={[
                            {
                                Header: <>{t('quiz.leaderboard.table.wallet-address-col')}</>,
                                accessor: 'wallet',
                                Cell: (cellProps: CellProps<LeaderboardItem, LeaderboardItem['wallet']>) => (
                                    <Link
                                        href={getEtherscanAddressLink(
                                            NetworkIdByName.OptimismMainnet,
                                            cellProps.cell.value
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {truncateAddress(cellProps.cell.value, 5)}
                                    </Link>
                                ),
                                sortable: false,
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
                                            <TwitterImage alt="twiiter" src={cellProps.cell.row.original.avatar} />
                                            {cellProps.cell.value}
                                        </TwitterTableContainer>
                                    </Link>
                                ),
                                sortable: true,
                                sortType: twitterSort(),
                            },
                            {
                                Header: <>{t('quiz.leaderboard.table.points-col')}</>,
                                accessor: 'points',
                                Cell: (cellProps: CellProps<LeaderboardItem, LeaderboardItem['points']>) => (
                                    <p>{cellProps.cell.value}</p>
                                ),
                                sortable: true,
                            },
                            {
                                Header: <>{t('quiz.leaderboard.table.time-col')}</>,
                                accessor: 'finishTime',
                                Cell: (cellProps: CellProps<LeaderboardItem, LeaderboardItem['finishTime']>) => (
                                    <p>{`${formatCurrency(cellProps.cell.value)}`}</p>
                                ),
                                sortable: true,
                            },
                        ]}
                        initialState={{
                            sortBy: [
                                {
                                    id: 'points',
                                    desc: true,
                                },
                            ],
                        }}
                        data={leaderboard}
                        isLoading={quizLeaderboardQuery.isLoading}
                        noResultsMessage={t('quiz.leaderboard.table.no-data-available')}
                    />
                </QuizContainer>
            </Container>
        </>
    );
};

const twitterSort = () => (rowA: any, rowB: any) => {
    return rowA.original.name.trim().localeCompare(rowB.original.name.trim());
};

export default Leaderboard;
