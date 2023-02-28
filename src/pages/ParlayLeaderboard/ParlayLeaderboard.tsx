import PositionSymbol from 'components/PositionSymbol';
import Search from 'components/Search';
import SelectInput from 'components/SelectInput';
import Table from 'components/Table';
import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import {
    OddsType,
    PARLAY_LEADERBOARD_BIWEEKLY_START_DATE,
    PARLAY_LEADERBOARD_BIWEEKLY_START_DATE_UTC,
    PARLAY_LEADERBOARD_FEBRUARY_REWARDS,
    PARLAY_LEADERBOARD_OPTIMISM_REWARDS,
    PARLAY_LEADERBOARD_ARBITRUM_REWARDS,
} from 'constants/markets';
import { t } from 'i18next';
import { addDays, differenceInDays, subMilliseconds } from 'date-fns';
import { PaginationWrapper } from 'pages/Quiz/styled-components';
import { AddressLink } from 'pages/Rewards/styled-components';
import { useParlayLeaderboardQuery } from 'queries/markets/useParlayLeaderboardQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CellProps } from 'react-table';
import { getIsAppReady } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow, FlexDivRowCentered, FlexDivStart } from 'styles/common';
import { ParlayMarketWithRank, PositionData, SportMarketInfo } from 'types/markets';
import { getEtherscanAddressLink } from 'utils/etherscan';
import { formatDateWithTime } from 'utils/formatters/date';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import {
    convertFinalResultToResultType,
    convertPositionNameToPosition,
    convertPositionNameToPositionType,
    formatMarketOdds,
    getOddTooltipText,
    getSpreadTotalText,
    getSymbolText,
} from 'utils/markets';
import { NetworkIdByName } from 'utils/network';
import TimeRemaining from 'components/TimeRemaining';

const ParlayLeaderboard: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const selectedOddsType = useSelector(getOddsType);
    const [searchText, setSearchText] = useState<string>('');
    const [expandStickyRow, setExpandStickyRowState] = useState<boolean>(false);
    const [periodEnd, setPeriodEnd] = useState<number>(0);

    const periodOptions: Array<{ value: number; label: string }> = [];

    let startingBiweeklyPeriod = 0;
    if (networkId !== NetworkIdByName.ArbitrumOne) {
        startingBiweeklyPeriod = 1;
        periodOptions.push({
            value: 0,
            label: `${t(`parlay-leaderboard.periods.february`)} 2023`,
        });
    }
    const latestPeriodBiweekly = Math.trunc(differenceInDays(new Date(), PARLAY_LEADERBOARD_BIWEEKLY_START_DATE) / 14);
    const numberOfPeriods = latestPeriodBiweekly + startingBiweeklyPeriod;

    for (let index = startingBiweeklyPeriod; index <= numberOfPeriods; index++) {
        periodOptions.push({
            value: index,
            label: `${t(`parlay-leaderboard.periods.bi-weekly-period`)} ${index + 1 - startingBiweeklyPeriod}`,
        });
    }

    const [period, setPeriod] = useState<number>(numberOfPeriods);

    useEffect(() => setPeriod(numberOfPeriods), [numberOfPeriods]);

    useEffect(() => {
        if (networkId !== NetworkIdByName.ArbitrumOne && period == 0) {
            setPeriodEnd(0);
        } else {
            setPeriodEnd(
                subMilliseconds(
                    addDays(PARLAY_LEADERBOARD_BIWEEKLY_START_DATE_UTC, (period + 1 - startingBiweeklyPeriod) * 14),
                    1
                ).getTime()
            );
        }
    }, [period, networkId, startingBiweeklyPeriod]);

    const parlayLeaderboardQuery = useParlayLeaderboardQuery(networkId, period, { enabled: isAppReady });

    const parlays = useMemo(() => {
        return parlayLeaderboardQuery.isSuccess && parlayLeaderboardQuery.data ? parlayLeaderboardQuery.data : [];
    }, [parlayLeaderboardQuery.isSuccess, parlayLeaderboardQuery.data]);

    const parlaysData = useMemo(() => {
        if (!searchText) return parlays;
        return parlays.filter((parlay) => parlay.account.toLowerCase().includes(searchText.toLowerCase()));
    }, [searchText, parlays]);

    const rewards =
        networkId !== NetworkIdByName.ArbitrumOne
            ? period === 0
                ? PARLAY_LEADERBOARD_FEBRUARY_REWARDS
                : PARLAY_LEADERBOARD_OPTIMISM_REWARDS
            : PARLAY_LEADERBOARD_ARBITRUM_REWARDS;

    const rewardsAmount = networkId !== NetworkIdByName.ArbitrumOne ? '2,000 OP' : '5,000 THALES';

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
                                        {rewards[data.rank - 1]}{' '}
                                        {networkId !== NetworkIdByName.ArbitrumOne ? 'OP' : 'THALES'}
                                    </>
                                }
                                component={
                                    <FlexDivRowCentered style={{ position: 'relative', width: 14 }}>
                                        <StatusIcon
                                            style={{ fontSize: 16, position: 'absolute', left: '-20px' }}
                                            color="rgb(95, 97, 128)"
                                            className={`icon ${
                                                networkId !== NetworkIdByName.ArbitrumOne
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
                    <StickyCell>{truncateAddress(data.account, 5)}</StickyCell>
                    <StickyCell>{formatMarketOdds(selectedOddsType, data.totalQuote)}</StickyCell>
                    <StickyCell>{formatCurrencyWithSign(USD_SIGN, data.sUSDPaid, 2)}</StickyCell>
                    <StickyCell>{formatCurrencyWithSign(USD_SIGN, data.totalAmount, 2)}</StickyCell>
                    <ExpandStickyRowIcon
                        className={!expandStickyRow ? 'icon icon--arrow-down' : 'icon icon--arrow-up'}
                        onClick={() => setExpandStickyRowState(!expandStickyRow)}
                    />
                </StickyContrainer>
                <ExpandedContainer hide={!expandStickyRow}>{getExpandedRow(data, selectedOddsType)}</ExpandedContainer>
            </StickyRow>
        );
    }, [expandStickyRow, parlays, walletAddress, selectedOddsType, rewards, networkId]);

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
                <Description>
                    <Trans
                        i18nKey="parlay-leaderboard.distribution-note"
                        components={{
                            bold: <BoldContent />,
                        }}
                    />
                </Description>
                <Description>{t('parlay-leaderboard.info')}</Description>
                <ul style={{ paddingLeft: 10 }}>
                    <Description>{t('parlay-leaderboard.info1')}</Description>
                    <Description>{t('parlay-leaderboard.info2')}</Description>
                </ul>
                <Description>{t('parlay-leaderboard.info3')}</Description>
                <Warning>{t('parlay-leaderboard.warning')}</Warning>
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
                        customStyle={{ border: '1px solid #fffff' }}
                        width={200}
                    />
                </LeaderboardHeader>
            </TextContainer>
            <Table
                data={parlaysData}
                tableRowHeadStyles={{ width: '100%' }}
                tableHeadCellStyles={TableHeaderStyle}
                tableRowCellStyles={TableRowStyle}
                columnsDeps={[rewards]}
                columns={[
                    {
                        accessor: 'rank',
                        Header: <>{t('rewards.table.rank')}</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['rank']>) => {
                            return cellProps.cell.value <= rewards.length ? (
                                <Tooltip
                                    overlay={
                                        <>
                                            {rewards[cellProps.cell.value - 1]}{' '}
                                            {networkId !== NetworkIdByName.ArbitrumOne ? 'OP' : 'THALES'}
                                        </>
                                    }
                                    component={
                                        <FlexDivRowCentered style={{ position: 'relative', width: 14 }}>
                                            <StatusIcon
                                                style={{ fontSize: 16, position: 'absolute', left: '-20px' }}
                                                color="rgb(95, 97, 128)"
                                                className={`icon ${
                                                    networkId !== NetworkIdByName.ArbitrumOne
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
                        accessor: 'numberOfPositions',
                        Header: <>{t('parlay-leaderboard.sidebar.positions')}</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['sportMarkets']>) => (
                            <TableText>{cellProps.cell.value}</TableText>
                        ),
                        sortable: true,
                    },
                    {
                        accessor: 'totalQuote',
                        Header: <>{t('parlay-leaderboard.sidebar.quote')}</>,
                        Cell: (cellProps: CellProps<ParlayMarketWithRank, ParlayMarketWithRank['totalQuote']>) => (
                            <TableText>{formatMarketOdds(selectedOddsType, cellProps.cell.value)}</TableText>
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
                expandedRow={(row) => {
                    const toRender = row.original.sportMarketsFromContract.map((address: string, index: number) => {
                        const position = row.original.positions.find(
                            (position: any) => position.market.address == address
                        );

                        const positionEnum = convertPositionNameToPositionType(position ? position.side : '');

                        const symbolText = getSymbolText(positionEnum, position.market);
                        const spreadTotalText = getSpreadTotalText(position.market, positionEnum);

                        return (
                            <ParlayRow style={{ opacity: getOpacity(position) }} key={index}>
                                <ParlayRowText>
                                    {getPositionStatus(position)}
                                    <ParlayRowTeam title={position.market.homeTeam + ' vs ' + position.market.awayTeam}>
                                        {position.market.homeTeam + ' vs ' + position.market.awayTeam}
                                    </ParlayRowTeam>
                                </ParlayRowText>
                                <PositionSymbol
                                    symbolAdditionalText={{
                                        text: formatMarketOdds(
                                            selectedOddsType,
                                            row.original.marketQuotes ? row.original.marketQuotes[index] : 0
                                        ),
                                        textStyle: {
                                            fontSize: '10.5px',
                                            marginLeft: '10px',
                                        },
                                    }}
                                    additionalStyle={{ width: 23, height: 23, fontSize: 10.5, borderWidth: 2 }}
                                    symbolText={symbolText}
                                    symbolUpperText={
                                        spreadTotalText
                                            ? {
                                                  text: spreadTotalText,
                                                  textStyle: {
                                                      backgroundColor: '#1A1C2B',
                                                      fontSize: '10px',
                                                      top: '-9px',
                                                      left: '10px',
                                                  },
                                              }
                                            : undefined
                                    }
                                    tooltip={<>{getOddTooltipText(positionEnum, position.market)}</>}
                                />
                                <QuoteText>{getParlayItemStatus(position.market)}</QuoteText>
                            </ParlayRow>
                        );
                    });

                    return (
                        <ExpandedRowWrapper>
                            <FirstSection>{toRender}</FirstSection>
                            <LastExpandedSection style={{ gap: 20 }}>
                                <QuoteWrapper>
                                    <QuoteLabel>{t('parlay-leaderboard.sidebar.total-quote')}:</QuoteLabel>
                                    <QuoteText>{formatMarketOdds(selectedOddsType, row.original.totalQuote)}</QuoteText>
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

export const getPositionStatus = (position: PositionData) => {
    if (position.market.isResolved) {
        if (
            convertPositionNameToPosition(position.side) === convertFinalResultToResultType(position.market.finalResult)
        ) {
            return <StatusIcon color="#5FC694" className={`icon icon--win`} />;
        } else {
            return <StatusIcon color="#E26A78" className={`icon icon--lost`} />;
        }
    } else {
        return <StatusIcon color="#FFFFFF" className={`icon icon--open`} />;
    }
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

const getExpandedRow = (parlay: ParlayMarketWithRank, selectedOddsType: OddsType) => {
    const gameList = parlay.sportMarketsFromContract.map((address: string, index: number) => {
        const position = parlay.positions.find((position: any) => position.market.address == address);
        if (!position) return;

        const positionEnum = convertPositionNameToPositionType(position ? position.side : '');

        const symbolText = getSymbolText(positionEnum, position.market);
        const spreadTotalText = getSpreadTotalText(position.market, positionEnum);

        return (
            <ParlayRow style={{ opacity: getOpacity(position) }} key={index}>
                <ParlayRowText>
                    {getPositionStatus(position)}
                    <ParlayRowTeam title={position.market.homeTeam + ' vs ' + position.market.awayTeam}>
                        {position.market.homeTeam + ' vs ' + position.market.awayTeam}
                    </ParlayRowTeam>
                </ParlayRowText>
                <PositionSymbol
                    symbolAdditionalText={{
                        text: formatMarketOdds(selectedOddsType, parlay.marketQuotes ? parlay.marketQuotes[index] : 0),
                        textStyle: {
                            fontSize: '10.5px',
                            marginLeft: '10px',
                        },
                    }}
                    additionalStyle={{ width: 23, height: 23, fontSize: 10.5, borderWidth: 2 }}
                    symbolText={symbolText}
                    symbolUpperText={
                        spreadTotalText
                            ? {
                                  text: spreadTotalText,
                                  textStyle: {
                                      backgroundColor: '#1A1C2B',
                                      fontSize: '10px',
                                      top: '-9px',
                                      left: '10px',
                                  },
                              }
                            : undefined
                    }
                    tooltip={<>{getOddTooltipText(positionEnum, position.market)}</>}
                />
                <QuoteText>{getParlayItemStatus(position.market)}</QuoteText>
            </ParlayRow>
        );
    });

    return (
        <ExpandedRowWrapper>
            <FirstSection>{gameList}</FirstSection>
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
    if (market.isResolved) return `${market.homeScore} : ${market.awayScore}`;
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
    color: #eeeee4;
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
    color: #eeeee4;
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
    color: #ffcc00;
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
    color: #eeeee4;
    @media (max-width: 600px) {
        font-size: 12px;
    }
`;

const quoteSort = (oddsType: OddsType) => (rowA: any, rowB: any) => {
    return oddsType === OddsType.AMM
        ? rowA.original.totalQuote - rowB.original.totalQuote
        : rowB.original.totalQuote - rowA.original.totalQuote;
};

export const StatusIcon = styled.i`
    font-size: 12px;
    font-weight: 700;
    margin-right: 4px;
    &::before {
        color: ${(props) => props.color || 'white'};
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
    color: '#5F6180',
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
    border-bottom: 2px dotted rgb(95, 97, 128);
    @media (max-width: 600px) {
        flex-direction: column;
        padding-left: 10px;
        padding-right: 10px;
    }
    @media (max-width: 400px) {
        padding: 0;
    }
`;

const ParlayRow = styled(FlexDivRowCentered)`
    margin-top: 10px;
    justify-content: space-evenly;
    &:last-child {
        margin-bottom: 10px;
    }
`;

const ParlayRowText = styled(QuoteText)`
    max-width: 220px;
`;

const ParlayRowTeam = styled.span`
    white-space: nowrap;
    width: 208px;
    overflow: hidden;
    text-overflow: ellipsis;
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
    border: 1px solid #ffffff;
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

export const BoldContent = styled.span`
    font-weight: 600;
`;

export default ParlayLeaderboard;
