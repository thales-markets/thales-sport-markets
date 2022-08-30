import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BackToLink from 'pages/Markets/components/BackToLink';
import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import Table from 'components/Table';
import { CellProps } from 'react-table';
import Search from 'components/Search';
import useQuizLeaderboardQuery from 'queries/quiz/useQuizLeaderboardQuery';
import { LeaderboardByWeeks, LeaderboardItem, LeaderboardList, WeeklyLeaderboard } from 'types/quiz';
import {
    LeaderboardContainer,
    Container,
    Description,
    LeaderboardTitleContainer,
    Link,
    TwitterImage,
    TwitterContainer,
    PaginationWrapper,
    LeaderboardIcon,
    SelectContainer,
    LeaderboardHeader,
    OvertimeVoucherIcon,
    PeriodContainer,
    PeriodEndContainer,
    PeriodEndLabel,
    OvertimeVoucherPopup,
} from '../styled-components';
import { getTwitterProfileLink } from 'utils/quiz';
import { formatCurrency, formatCurrencyWithKey } from 'utils/formatters/number';
import { CURRENCY_MAP } from 'constants/currency';
import { truncateAddress } from 'utils/formatters/string';
import HelpUsImprove from '../HelpUsImprove';
import { DEFAULT_TWITTER_PROFILE_IMAGE } from 'constants/quiz';
import SelectInput from 'components/SelectInput';
import overtimeVoucherIcon from 'assets/images/overtime-voucher.svg';
import TimeRemaining from 'components/TimeRemaining';
import Tooltip from 'components/Tooltip';

const Leaderboard: React.FC = () => {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState<string>('');
    const [isInitialQueryLoad, setIsInitialQueryLoad] = useState<boolean>(true);
    const [leaderboard, setLeaderboard] = useState<LeaderboardList>([]);
    const [weekEnd, setWeekEnd] = useState<number>(0);
    const [weekOptions, setWeekOptions] = useState<Array<{ value: number; label: string }>>([]);
    const [week, setWeek] = useState<number>(0);

    const NOW = new Date();

    const quizLeaderboardQuery = useQuizLeaderboardQuery();

    useEffect(() => {
        if (quizLeaderboardQuery.isSuccess && quizLeaderboardQuery.data) {
            const leaderboardByWeeks: LeaderboardByWeeks = quizLeaderboardQuery.data;
            let selectedWeek = week;
            if (isInitialQueryLoad) {
                selectedWeek =
                    leaderboardByWeeks.length > 0 ? leaderboardByWeeks[leaderboardByWeeks.length - 1].week : 0;

                const options: Array<{ value: number; label: string }> = [];
                for (let index = 0; index < leaderboardByWeeks.length; index++) {
                    options.push({
                        value: index,
                        label: `${t('quiz.leaderboard.week-label')} ${index + 1}`,
                    });
                    setWeekOptions(options);
                }
                setWeek(selectedWeek);
                setIsInitialQueryLoad(false);
            }

            const weeklyLeaderboard: WeeklyLeaderboard = leaderboardByWeeks[selectedWeek];
            let currentLeaderboard = weeklyLeaderboard.leaderboard;

            if (searchText.trim() !== '') {
                currentLeaderboard = currentLeaderboard.filter(
                    (item: LeaderboardItem) =>
                        item.wallet.toLowerCase().includes(searchText.toLowerCase()) ||
                        item.name.toLowerCase().includes(searchText.toLowerCase())
                );
            }
            setLeaderboard(currentLeaderboard);
            setWeekEnd(new Date(weeklyLeaderboard.weekEnd).getTime());
        }
    }, [quizLeaderboardQuery.data, quizLeaderboardQuery.isSuccess, searchText, week, isInitialQueryLoad, t]);

    const [page, setPage] = useState(0);
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const [rowsPerPage, setRowsPerPage] = useState(20);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    useEffect(() => setPage(0), [searchText, week]);

    const isMobile = window.innerWidth < 768;
    const isSmallScreen = window.innerWidth <= 512;

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
                    <LeaderboardHeader>
                        <PeriodContainer>
                            {!isInitialQueryLoad && (
                                <>
                                    <SelectContainer>
                                        <SelectInput
                                            options={weekOptions}
                                            handleChange={(value) => setWeek(Number(value))}
                                            defaultValue={week}
                                            width={200}
                                        />
                                    </SelectContainer>
                                    {NOW.getTime() < weekEnd ? (
                                        <PeriodEndContainer>
                                            <PeriodEndLabel>{t('quiz.leaderboard.period-end-label')}:</PeriodEndLabel>
                                            <TimeRemaining end={weekEnd} fontSize={18} showFullCounter />
                                        </PeriodEndContainer>
                                    ) : (
                                        <PeriodEndContainer>
                                            <PeriodEndLabel>{t('quiz.leaderboard.period-ended-label')}</PeriodEndLabel>
                                        </PeriodEndContainer>
                                    )}
                                </>
                            )}
                        </PeriodContainer>
                        <Search
                            text={searchText}
                            customPlaceholder={t('quiz.leaderboard.search-placeholder')}
                            handleChange={(e) => setSearchText(e)}
                            customStyle={{ border: '1px solid #1A1C2B' }}
                            width={200}
                        />
                    </LeaderboardHeader>
                    <Table
                        tableRowStyles={{
                            fontSize: 16,
                            minHeight: isSmallScreen ? 34 : isMobile ? 40 : 48,
                            borderBottom: '2px dotted rgba(255, 255, 255, 0.3)',
                        }}
                        tableRowHeadStyles={{ borderBottom: '2px solid rgba(255, 255, 255, 0.3)', color: '#5F6180' }}
                        columns={[
                            {
                                Header: <>{isMobile ? '#' : t('quiz.leaderboard.table.rank-col')}</>,
                                accessor: 'ranking',
                                Cell: (cellProps: CellProps<LeaderboardItem, LeaderboardItem['ranking']>) => (
                                    <p>{cellProps.cell.value}</p>
                                ),
                                sortable: true,
                                width: isSmallScreen ? '35px' : isMobile ? '50px' : '100px',
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
                                        <TwitterContainer>
                                            <TwitterImage
                                                alt="tw"
                                                src={
                                                    cellProps.cell.row.original.avatar != ''
                                                        ? cellProps.cell.row.original.avatar
                                                        : DEFAULT_TWITTER_PROFILE_IMAGE
                                                }
                                            />
                                            {cellProps.cell.value}
                                        </TwitterContainer>
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
                                width: isSmallScreen ? '55px' : isMobile ? '100px' : 'initial',
                            },
                            {
                                Header: <>{t('quiz.leaderboard.table.time-col')}</>,
                                accessor: 'finishTime',
                                Cell: (cellProps: CellProps<LeaderboardItem, LeaderboardItem['finishTime']>) => (
                                    <p>{`${formatCurrency(cellProps.cell.value)}`}</p>
                                ),
                                sortable: true,
                                width: isSmallScreen ? '50px' : isMobile ? '100px' : 'initial',
                            },
                            {
                                Header: <>{t('quiz.leaderboard.table.rewards-col')}</>,
                                accessor: 'price',
                                Cell: (cellProps: CellProps<LeaderboardItem, LeaderboardItem['price']>) => {
                                    return cellProps.cell.value > 0 ? (
                                        <Tooltip
                                            overlay={
                                                <OvertimeVoucherPopup
                                                    title={t('quiz.leaderboard.overtime-voucher')}
                                                    imageSrc={cellProps.row.original.voucherUrl}
                                                />
                                            }
                                            component={
                                                <p style={{ display: 'flex', alignItems: 'center' }}>
                                                    {cellProps.cell.value > 0 && (
                                                        <OvertimeVoucherIcon src={overtimeVoucherIcon} />
                                                    )}
                                                    {cellProps.cell.value
                                                        ? `${formatCurrencyWithKey(
                                                              CURRENCY_MAP.sUSD,
                                                              cellProps.cell.value,
                                                              0,
                                                              true
                                                          )}`
                                                        : ''}
                                                </p>
                                            }
                                            overlayClassName="overtime-voucher-overlay"
                                        />
                                    ) : (
                                        <p style={{ display: 'flex', alignItems: 'center' }}>
                                            {cellProps.cell.value > 0 && (
                                                <OvertimeVoucherIcon src={overtimeVoucherIcon} />
                                            )}
                                            {cellProps.cell.value
                                                ? `${formatCurrencyWithKey(
                                                      CURRENCY_MAP.sUSD,
                                                      cellProps.cell.value,
                                                      0,
                                                      true
                                                  )}`
                                                : ''}
                                        </p>
                                    );
                                },
                                sortable: true,
                                width: isSmallScreen ? '70px' : isMobile ? '100px' : 'initial',
                            },
                        ]}
                        initialState={{
                            sortBy: [
                                {
                                    id: 'ranking',
                                    desc: false,
                                },
                            ],
                            pageIndex: 0,
                            hiddenColumns: isMobile ? ['wallet'] : [],
                        }}
                        data={leaderboard}
                        isLoading={quizLeaderboardQuery.isLoading || isInitialQueryLoad}
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
                <HelpUsImprove />
            </Container>
        </>
    );
};

const twitterSort = () => (rowA: any, rowB: any) => {
    return rowA.original.name.trim().localeCompare(rowB.original.name.trim());
};

export default Leaderboard;
