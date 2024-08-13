import SPAAnchor from 'components/SPAAnchor';
import Search from 'components/Search';
import SelectInput from 'components/SelectInput';
import Table from 'components/Table';
import TimeRemaining from 'components/TimeRemaining';
import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { LINKS } from 'constants/links';
import {
    PARLAY_LEADERBOARD_ARBITRUM_REWARDS_TOP_20,
    PARLAY_LEADERBOARD_OPTIMISM_REWARDS_TOP_20,
    PARLAY_LEADERBOARD_UNIQUE_REWARDS_TOP_20,
    PARLAY_LEADERBOARD_WEEKLY_START_DATE_UTC,
    START_PERIOD_UNIQUE_REWARDS,
} from 'constants/markets';
import { addDays, subMilliseconds } from 'date-fns';
import { OddsType } from 'enums/markets';
import { Network } from 'enums/network';
import i18n from 'i18n';
import { t } from 'i18next';
import { getParlayRow } from 'pages/Profile/components/TransactionsHistory/components/ParlayTransactions/ParlayTransactions';
import { PaginationWrapper } from 'pages/Quiz/styled-components';
import { useParlayLeaderboardQuery } from 'queries/markets/useParlayLeaderboardQuery';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CellProps } from 'react-table';
import { getIsAppReady } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow, FlexDivRowCentered, FlexDivStart } from 'styles/common';
import {
    formatCurrency,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    formatDateWithTime,
    getEtherscanAddressLink,
    truncateAddress,
} from 'thales-utils';
import { CombinedMarket, ParlayMarket, ParlayMarketWithRank, PositionData, SportMarketInfo } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import {
    extractCombinedMarketsFromParlayMarketType,
    isCombinedMarketWinner,
    removeCombinedMarketsFromParlayMarketType,
} from 'utils/combinedMarkets';
import {
    convertFinalResultToResultType,
    convertPositionNameToPosition,
    formatMarketOdds,
    syncPositionsAndMarketsPerContractOrderInParlay,
} from 'utils/markets';
import { formatParlayOdds } from 'utils/parlay';

const ParlayLeaderboard: React.FC = () => {
    const { t } = useTranslation();
    const language = i18n.language;
    const theme: ThemeInterface = useTheme();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const selectedOddsType = useSelector(getOddsType);
    const [searchText, setSearchText] = useState<string>('');
    const [expandStickyRow, setExpandStickyRowState] = useState<boolean>(false);
    const [periodEnd, setPeriodEnd] = useState<number>(0);

    const periodOptions: Array<{ value: number; label: string }> = [];

    const latestPeriodWeekly = 25;

    for (let index = 0; index <= latestPeriodWeekly; index++) {
        periodOptions.push({
            value: index,
            label: `${t(`parlay-leaderboard.periods.weekly-period`)} ${index + 1}`,
        });
    }

    const [period, setPeriod] = useState<number>(latestPeriodWeekly);

    useEffect(() => setPeriod(latestPeriodWeekly), [latestPeriodWeekly]);

    useEffect(
        () =>
            setPeriodEnd(
                subMilliseconds(addDays(PARLAY_LEADERBOARD_WEEKLY_START_DATE_UTC, (period + 1) * 7), 1).getTime()
            ),
        [period, networkId]
    );

    const parlayLeaderboardQuery = useParlayLeaderboardQuery(networkId, period, { enabled: isAppReady });

    const parlays = useMemo(() => {
        return parlayLeaderboardQuery.isSuccess && parlayLeaderboardQuery.data ? parlayLeaderboardQuery.data : [];
    }, [parlayLeaderboardQuery.isSuccess, parlayLeaderboardQuery.data]);

    const parlaysData = useMemo(() => {
        if (!searchText) return parlays;
        return parlays.filter((parlay) => parlay.account.toLowerCase().includes(searchText.toLowerCase()));
    }, [searchText, parlays]);

    const rewards = getRewardsArray(networkId, period);
    const rewardsAmount = getRewardsAmount(networkId, period);
    const rewardsCurrency = getRewardsCurrency(networkId);

    const exchangeRatesQuery = useExchangeRatesQuery(networkId, {
        enabled: isAppReady,
    });
    const exchangeRates: Rates | null =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : null;

    const rewardCurrencyRate = exchangeRates && exchangeRates !== null ? exchangeRates[rewardsCurrency] : 0;

    const stickyRow = useMemo(() => {
        const data = parlays.find((parlay) => parlay.account.toLowerCase() == walletAddress?.toLowerCase());
        if (!data) return undefined;
        return (
            <StickyRow>
                <StickyContrainer>
                    <StickyCell>
                        {data.rank <= rewards.length ? (
                            <Tooltip
                                overlay={
                                    <>
                                        {rewards[data.rank - 1]} {rewardsCurrency}
                                    </>
                                }
                                component={
                                    <FlexDivRowCentered style={{ position: 'relative', width: 14 }}>
                                        <StatusIcon
                                            style={{ fontSize: 16, position: 'absolute', left: '-20px' }}
                                            color={theme.background.tertiary}
                                            className={`icon ${
                                                networkId !== Network.Arbitrum
                                                    ? 'icon--op-rewards'
                                                    : 'icon--thales-rewards'
                                            }`}
                                        />
                                        <TableText>{data.rank}</TableText>
                                    </FlexDivRowCentered>
                                }
                            ></Tooltip>
                        ) : (
                            <TableText>{data.rank}</TableText>
                        )}
                    </StickyCell>
                    <StickyCell>
                        {data.rank <= rewards.length ? (
                            <>
                                {`${rewards[data.rank - 1]} ${rewardsCurrency} (${formatCurrencyWithSign(
                                    USD_SIGN,
                                    (rewards[data.rank - 1] || 0) * rewardCurrencyRate,
                                    0
                                )})`}
                            </>
                        ) : (
                            <TableText></TableText>
                        )}
                    </StickyCell>
                    <StickyCell>{truncateAddress(data.account, 5)}</StickyCell>
                    <StickyCell>{formatCurrency(data.points)}</StickyCell>
                    <StickyCell>{formatCurrency(data.numberOfPositions)}</StickyCell>
                    <StickyCell>{formatParlayOdds(selectedOddsType, data.sUSDPaid, data.totalAmount)}</StickyCell>
                    <StickyCell>{formatCurrencyWithSign(USD_SIGN, data.sUSDPaid, 2)}</StickyCell>
                    <StickyCell>{formatCurrencyWithSign(USD_SIGN, data.totalAmount, 2)}</StickyCell>
                    <ExpandStickyRowIcon
                        className={!expandStickyRow ? 'icon icon--arrow-down' : 'icon icon--arrow-up'}
                        onClick={() => setExpandStickyRowState(!expandStickyRow)}
                    />
                </StickyContrainer>
                <ExpandedContainer hide={!expandStickyRow}>
                    {getExpandedRow(data, selectedOddsType, language, theme)}
                </ExpandedContainer>
            </StickyRow>
        );
    }, [
        parlays,
        rewards,
        networkId,
        selectedOddsType,
        expandStickyRow,
        language,
        walletAddress,
        theme,
        rewardsCurrency,
        rewardCurrencyRate,
    ]);

    const [page, setPage] = useState(0);
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const [rowsPerPage, setRowsPerPage] = useState(50);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    useEffect(() => setPage(0), [searchText, period]);

    return (
        <Container>
            <TextContainer>
                <Title>{t('parlay-leaderboard.title')}</Title>
                <Description>
                    <Trans
                        i18nKey="parlay-leaderboard.description"
                        components={{
                            bold: <BoldContent />,
                        }}
                        values={{
                            amount: rewardsAmount,
                        }}
                    />
                </Description>
                <Description>{t('parlay-leaderboard.info')}</Description>
                <Description>
                    <Trans
                        i18nKey="parlay-leaderboard.distribution-note"
                        components={{
                            bold: <BoldContent />,
                        }}
                    />
                </Description>
                <Warning>{t('parlay-leaderboard.warning')}</Warning>
                <Warning>{t('parlay-leaderboard.warning2')}</Warning>
                <DeprecatedContainer>{t('parlay-leaderboard.deprecated-info')}</DeprecatedContainer>
                <LeaderboardHeader>
                    <PeriodContainer>
                        <SelectContainer>
                            <SelectInput
                                options={periodOptions}
                                handleChange={(value) => setPeriod(Number(value))}
                                defaultValue={period}
                                width={230}
                            />
                        </SelectContainer>
                        {new Date().getTime() < periodEnd ? (
                            <PeriodEndContainer>
                                <PeriodEndLabel>{t('parlay-leaderboard.periods.period-end-label')}:</PeriodEndLabel>
                                <TimeRemaining end={periodEnd} fontSize={16} showFullCounter />
                            </PeriodEndContainer>
                        ) : (
                            <PeriodEndContainer>
                                <PeriodEndLabel>{t('parlay-leaderboard.periods.period-ended-label')}</PeriodEndLabel>
                            </PeriodEndContainer>
                        )}
                    </PeriodContainer>
                    <Search
                        text={searchText}
                        customPlaceholder={t('rewards.search-placeholder')}
                        handleChange={(e) => setSearchText(e)}
                        width={200}
                    />
                </LeaderboardHeader>
            </TextContainer>
            <Table
                data={parlaysData}
                tableRowHeadStyles={{ width: '100%' }}
                tableHeadCellStyles={{
                    ...TableHeaderStyle,
                    color: theme.textColor.secondary,
                }}
                tableRowCellStyles={TableRowStyle}
                columnsDeps={[rewards, rewardCurrencyRate]}
                columns={[
                    {
                        accessor: 'rank',
                        Header: <>{t('rewards.table.rank')}</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['rank']>) => {
                            return cellProps.cell.value <= rewards.length ? (
                                <Tooltip
                                    overlay={
                                        <>
                                            {rewards[cellProps.cell.value - 1]} {getRewardsCurrency(networkId)}
                                        </>
                                    }
                                    component={
                                        <FlexDivRowCentered style={{ position: 'relative', width: 14 }}>
                                            <StatusIcon
                                                style={{ fontSize: 16, position: 'absolute', left: '-20px' }}
                                                color={theme.background.tertiary}
                                                className={`icon ${
                                                    networkId !== Network.Arbitrum
                                                        ? 'icon--op-rewards'
                                                        : 'icon--thales-rewards'
                                                }`}
                                            />
                                            <TableText>{cellProps.cell.value}</TableText>
                                        </FlexDivRowCentered>
                                    }
                                ></Tooltip>
                            ) : (
                                <TableText>{cellProps.cell.value}</TableText>
                            );
                        },
                        sortable: true,
                    },
                    {
                        Header: <>{t('parlay-leaderboard.sidebar.reward')}</>,
                        accessor: 'id',
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['id']>) => {
                            return cellProps.row.original.rank <= rewards.length ? (
                                <TableText>
                                    {`${
                                        rewards[cellProps.row.original.rank - 1]
                                    } ${rewardsCurrency} (${formatCurrencyWithSign(
                                        USD_SIGN,
                                        (rewards[cellProps.row.original.rank - 1] || 0) * rewardCurrencyRate,
                                        0
                                    )})`}
                                </TableText>
                            ) : (
                                <TableText></TableText>
                            );
                        },
                        sortable: true,
                    },
                    {
                        Header: <>{t('rewards.table.wallet-address')}</>,
                        accessor: 'account',
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['account']>) => (
                            <AddressLink
                                href={getEtherscanAddressLink(networkId, cellProps.cell.value)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: 12 }}
                            >
                                {truncateAddress(cellProps.cell.value, 5)}
                            </AddressLink>
                        ),
                    },
                    {
                        accessor: 'points',
                        Header: <>{t('parlay-leaderboard.sidebar.points')}</>,
                        Cell: (cellProps: any) => <TableText>{formatCurrency(cellProps.cell.value)}</TableText>,
                        sortable: true,
                    },
                    {
                        accessor: 'numberOfPositions',
                        Header: <>{t('parlay-leaderboard.sidebar.positions')}</>,
                        Cell: (cellProps: any) => {
                            let numberOfMarketsModifiedWithCombinedPositions = 0;

                            if (cellProps.row.original.isV2) {
                                numberOfMarketsModifiedWithCombinedPositions = cellProps.row.original.numberOfPositions;
                            } else {
                                const parlay = syncPositionsAndMarketsPerContractOrderInParlay(
                                    cellProps.row.original as ParlayMarket
                                );
                                const combinedMarkets = extractCombinedMarketsFromParlayMarketType(parlay);
                                numberOfMarketsModifiedWithCombinedPositions =
                                    combinedMarkets.length > 0
                                        ? parlay.sportMarkets.length - combinedMarkets.length
                                        : parlay.sportMarkets.length;
                            }
                            return (
                                <FlexCenter>
                                    <TableText>{numberOfMarketsModifiedWithCombinedPositions}</TableText>
                                </FlexCenter>
                            );
                        },
                        sortable: true,
                    },
                    {
                        accessor: 'totalQuote',
                        Header: <>{t('parlay-leaderboard.sidebar.quote')}</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['totalQuote']>) => (
                            <TableText>
                                {formatParlayOdds(
                                    selectedOddsType,
                                    cellProps.row.original.sUSDPaid,
                                    cellProps.row.original.totalAmount
                                )}
                            </TableText>
                        ),
                        sortable: true,
                        sortType: quoteSort(selectedOddsType),
                    },
                    {
                        accessor: 'sUSDPaid',
                        Header: <>{t('parlay-leaderboard.sidebar.paid')}</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['sUSDAfterFees']>) => (
                            <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>
                        ),
                        sortable: true,
                    },
                    {
                        accessor: 'totalAmount',
                        Header: <>{t('parlay-leaderboard.sidebar.won')}</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['totalAmount']>) => (
                            <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>
                        ),
                        sortable: true,
                    },
                ]}
                noResultsMessage={t('parlay-leaderboard.no-parlays')}
                stickyRow={stickyRow}
                hideExpandedRow={(row) => row.original.isV2}
                expandedRow={(row) => {
                    const parlay = syncPositionsAndMarketsPerContractOrderInParlay(row.original as ParlayMarket);

                    const combinedMarkets = extractCombinedMarketsFromParlayMarketType(parlay);
                    const parlayWithoutCombinedMarkets = removeCombinedMarketsFromParlayMarketType(parlay);

                    const toRender = getParlayRow(
                        parlayWithoutCombinedMarkets,
                        selectedOddsType,
                        language,
                        theme,
                        combinedMarkets
                    );

                    return (
                        <ExpandedRowWrapper>
                            <FirstSection>{toRender}</FirstSection>
                            <LastExpandedSection style={{ gap: 20 }}>
                                <QuoteWrapper>
                                    <QuoteLabel>{t('parlay-leaderboard.sidebar.total-quote')}:</QuoteLabel>
                                    <QuoteText>
                                        {formatParlayOdds(
                                            selectedOddsType,
                                            row.original.sUSDPaid,
                                            row.original.totalAmount
                                        )}
                                    </QuoteText>
                                </QuoteWrapper>

                                <QuoteWrapper>
                                    <QuoteLabel>{t('parlay-leaderboard.sidebar.total-amount')}:</QuoteLabel>
                                    <QuoteText>
                                        {formatCurrencyWithKey(USD_SIGN, row.original.totalAmount, 2)}
                                    </QuoteText>
                                </QuoteWrapper>
                            </LastExpandedSection>
                        </ExpandedRowWrapper>
                    );
                }}
                additionalCell={(row) => (
                    <Tooltip
                        overlay={t('parlay-leaderboard.v2-tooltip')}
                        component={
                            <TagV2Container>
                                <SPAAnchor href={`${LINKS.V2}tickets/${row.original.id}`}>
                                    <TagV2>{row.original.isV2 ? 'v2' : 'v1'}</TagV2>
                                </SPAAnchor>
                            </TagV2Container>
                        }
                    />
                )}
                onSortByChanged={() => setPage(0)}
                currentPage={page}
                rowsPerPage={rowsPerPage}
                isLoading={parlayLeaderboardQuery.isLoading}
            ></Table>
            <PaginationWrapper
                rowsPerPageOptions={[10, 20, 50, 100]}
                count={parlaysData.length ? parlaysData.length : 0}
                labelRowsPerPage={t(`common.pagination.rows-per-page`)}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Container>
    );
};

export const getPositionStatus = (position: PositionData, theme: ThemeInterface) => {
    if (position.market.isResolved) {
        if (
            convertPositionNameToPosition(position.side) === convertFinalResultToResultType(position.market.finalResult)
        ) {
            return <StatusIcon color={theme.status.win} className={`icon icon--win`} />;
        } else {
            return <StatusIcon color={theme.status.loss} className={`icon icon--lost`} />;
        }
    } else {
        return <StatusIcon color={theme.status.open} className={`icon icon--open`} />;
    }
};

export const getPositionStatusForCombinedMarket = (combinedMarket: CombinedMarket, theme: ThemeInterface) => {
    const isOpen = combinedMarket.markets[0].isOpen || combinedMarket.markets[1].isOpen;
    if (isOpen) return <StatusIcon color={theme.status.open} className={`icon icon--open`} />;
    if (isCombinedMarketWinner(combinedMarket.markets, combinedMarket.positions))
        return <StatusIcon color={theme.status.win} className={`icon icon--win`} />;
    return <StatusIcon color={theme.status.loss} className={`icon icon--lost`} />;
};

export const getOpacity = (position: PositionData) => {
    if (position.market.isResolved) {
        if (
            convertPositionNameToPosition(position.side) === convertFinalResultToResultType(position.market.finalResult)
        ) {
            return 1;
        } else {
            return 0.5;
        }
    } else {
        return 1;
    }
};

const getExpandedRow = (
    parlay: ParlayMarketWithRank,
    selectedOddsType: OddsType,
    language: string,
    theme: ThemeInterface
) => {
    const modifiedParlay = syncPositionsAndMarketsPerContractOrderInParlay(parlay);

    const combinedMarkets = extractCombinedMarketsFromParlayMarketType(modifiedParlay);
    const parlayWithoutCombinedMarkets = removeCombinedMarketsFromParlayMarketType(modifiedParlay);

    const toRender = getParlayRow(parlayWithoutCombinedMarkets, selectedOddsType, language, theme, combinedMarkets);

    return (
        <ExpandedRowWrapper>
            <FirstSection>{toRender}</FirstSection>
            <LastExpandedSection style={{ gap: 20 }}>
                <QuoteWrapper>
                    <QuoteLabel>{t('parlay-leaderboard.sidebar.total-quote')}:</QuoteLabel>
                    <QuoteText>{formatMarketOdds(selectedOddsType, parlay.totalQuote)}</QuoteText>
                </QuoteWrapper>

                <QuoteWrapper>
                    <QuoteLabel>{t('parlay-leaderboard.sidebar.total-amount')}:</QuoteLabel>
                    <QuoteText>{formatCurrencyWithKey(USD_SIGN, parlay.totalAmount, 2)}</QuoteText>
                </QuoteWrapper>
            </LastExpandedSection>
        </ExpandedRowWrapper>
    );
};

export const getParlayItemStatus = (market: SportMarketInfo) => {
    if (market.isCanceled) return t('profile.card.canceled');
    if (market.isResolved) {
        if (market.playerName !== null) {
            return market.playerPropsScore;
        }
        return `${market.homeScore} : ${market.awayScore}`;
    }
    return formatDateWithTime(Number(market.maturityDate) * 1000);
};

const Container = styled(FlexDivColumn)`
    position: relative;
    align-items: center;
    max-width: 800px;
    width: 100%;
`;

const TextContainer = styled.div`
    padding: 20px 0;
    text-align: justify;
`;

const Title = styled.p`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 150%;
    text-align: justify;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.textColor.primary};
    margin: 10px 0;
`;

const Description = styled.p`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 150%;
    text-align: justify;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 10px;
`;

const Warning = styled.p`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 150%;
    text-align: justify;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.warning.textColor.primary};
    margin-bottom: 10px;
`;

const TableText = styled.p`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 150%;
    text-align: center;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    @media (max-width: 600px) {
        font-size: 12px;
    }
`;

const quoteSort = (oddsType: OddsType) => (rowA: any, rowB: any) => {
    return oddsType === OddsType.AMM
        ? rowA.original.totalQuote - rowB.original.totalQuote
        : rowB.original.totalQuote - rowA.original.totalQuote;
};

const StatusIcon = styled.i`
    font-size: 12px;
    font-weight: 700;
    margin-right: 4px;
    &::before {
        color: ${(props) => props.color || props.theme.status.open};
    }
`;

const QuoteText = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    text-align: left;
    white-space: nowrap;
    display: flex;
`;

const QuoteLabel = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 12px;

    letter-spacing: 0.025em;
    text-transform: uppercase;
`;

const QuoteWrapper = styled.div`
    display: flex;
    flex: flex-start;
    align-items: center;
    gap: 6px;
    margin-left: 30px;
    @media (max-width: 600px) {
        margin-left: 0;
    }
`;

const TableHeaderStyle: React.CSSProperties = {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '10px',
    lineHeight: '12px',
    textAlign: 'center',
    textTransform: 'uppercase',
    justifyContent: 'center',
};

const TableRowStyle: React.CSSProperties = {
    justifyContent: 'center',
    padding: '0',
};

const ExpandedRowWrapper = styled.div`
    display: flex;
    justify-content: space-evenly;
    padding-left: 60px;
    padding-right: 60px;
    border-bottom: 2px dotted ${(props) => props.theme.borderColor.primary};
    @media (max-width: 600px) {
        flex-direction: column;
        padding-left: 10px;
        padding-right: 10px;
    }
    @media (max-width: 400px) {
        padding: 0;
    }
`;

const FirstSection = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
`;

const LastExpandedSection = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    @media (max-width: 600px) {
        flex-direction: row;
        margin: 10px 0;
    }
`;

const StickyRow = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px;
    border: 1px solid ${(props) => props.theme.borderColor.secondary};
    border-radius: 7px;
`;

const StickyContrainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
`;

const StickyCell = styled.div`
    text-align: center;
`;

const ExpandStickyRowIcon = styled.i`
    position: absolute;
    font-size: 9px;
    right: 10px;
`;

const ExpandedContainer = styled.div<{ hide?: boolean }>`
    display: ${(_props) => (_props?.hide ? 'none' : 'flex')};
    flex-direction: column;
`;

const LeaderboardHeader = styled(FlexDivRow)`
    align-items: center;
    margin-bottom: 10px;
    @media screen and (max-width: 767px) {
        flex-direction: column;
    }
`;

const FlexCenter = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const SelectContainer = styled.div`
    margin-left: 1px;
    width: 230px;
    @media screen and (max-width: 767px) {
        margin-bottom: 10px;
    }
`;

const PeriodContainer = styled(FlexDivStart)`
    align-items: center;
    @media screen and (max-width: 767px) {
        flex-direction: column;
    }
`;

const PeriodEndContainer = styled(FlexDivStart)`
    margin-left: 10px;
    margin-right: 10px;
    @media screen and (max-width: 767px) {
        margin-left: 0px;
        margin-right: 0px;
        margin-top: 6px;
        margin-bottom: 15px;
    }
`;

const PeriodEndLabel = styled.span`
    font-size: 16px;
    margin-right: 6px;
`;

const BoldContent = styled.span`
    font-weight: 600;
`;

const AddressLink = styled.a`
    color: ${(props) => props.theme.textColor.primary};
    &:hover {
        color: ${(props) => props.theme.textColor.quaternary};
    }
`;

const TagV2Container = styled.div`
    margin-top: 10px;
`;

const TagV2 = styled.span`
    color: ${(props) => props.theme.textColor.tertiary};
    background-color: #3fffff;
    font-size: 11px;
    font-weight: 600;
    line-height: 13px;
    text-align: center;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    border-radius: 5px;
    padding: 2px 2px;
    height: fit-content;
    cursor: pointer;
`;

export const DeprecatedContainer = styled(FlexDiv)`
    width: 100%;
    background-color: ${(props) => props.theme.background.tertiary};
    border-radius: 10px;
    min-height: 30px;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    padding: 5px 10px;
    text-align: center;
    margin-top: 10px;
    margin-bottom: 10px;
    @media (max-width: 767px) {
        font-size: 14px;
    }
`;

export const getRewardsArray = (networkId: Network, period: number): number[] => {
    if (period >= START_PERIOD_UNIQUE_REWARDS) return PARLAY_LEADERBOARD_UNIQUE_REWARDS_TOP_20;
    if (networkId == Network.Arbitrum) return PARLAY_LEADERBOARD_ARBITRUM_REWARDS_TOP_20;
    return PARLAY_LEADERBOARD_OPTIMISM_REWARDS_TOP_20;
};

const getRewardsAmount = (networkId: Network, period: number) => {
    if (networkId == Network.Arbitrum) return period >= START_PERIOD_UNIQUE_REWARDS ? '1,000 ARB' : '2,500 ARB';
    if (networkId == Network.OptimismMainnet) return period >= START_PERIOD_UNIQUE_REWARDS ? '1,000 OP' : '500 OP';
    return '1,000 THALES';
};

export const getRewardsCurrency = (networkId: Network) => {
    if (networkId == Network.Arbitrum) return 'ARB';
    if (networkId == Network.OptimismMainnet) return 'OP';
    return 'THALES';
};

export default ParlayLeaderboard;
