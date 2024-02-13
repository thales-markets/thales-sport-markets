import PositionSymbol from 'components/PositionSymbol';
import SPAAnchor from 'components/SPAAnchor';
import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { BetTypeNameMap } from 'constants/tags';
import { BetType, OddsType, Position } from 'enums/markets';
import i18n from 'i18n';
import { t } from 'i18next';
import ShareTicketModal from 'pages/Markets/Home/Parlay/components/ShareTicketModal';
import { ShareTicketModalProps } from 'pages/Markets/Home/Parlay/components/ShareTicketModal/ShareTicketModal';
import { TwitterIcon } from 'pages/Markets/Home/Parlay/components/styled-components';
import { useMarketParlaysQuery } from 'queries/markets/useMarketParlaysQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getOddsType } from 'redux/modules/ui';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import {
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    formatDateWithTime,
    formatTxTimestamp,
    getEtherscanTxLink,
    truncateAddress,
} from 'thales-utils';
import {
    CombinedMarket,
    ParlayMarket,
    ParlayMarketWithQuotes,
    ParlaysMarket,
    PositionData,
    SportMarketInfo,
} from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { getDefaultCollateral } from 'utils/collaterals';
import {
    extractCombinedMarketsFromParlayMarketType,
    getCombinedPositionName,
    isCombinedMarketWinner,
    removeCombinedMarketsFromParlayMarketType,
} from 'utils/combinedMarkets';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import {
    convertFinalResultToResultType,
    convertPositionNameToPosition,
    convertPositionNameToPositionType,
    formatMarketOdds,
    getCombinedOddTooltipText,
    getOddTooltipText,
    getParentMarketAddress,
    getSpreadAndTotalTextForCombinedMarket,
    getSpreadTotalText,
    getSymbolText,
    isOneSidePlayerProps,
    isParlayOpen,
    isParlayWon,
    isSpecialYesNoProp,
    syncPositionsAndMarketsPerContractOrderInParlay,
} from 'utils/markets';
import { formatParlayOdds } from 'utils/parlay';
import { buildMarketLink } from 'utils/routes';
import { Container } from './styled-components';

const ParlayTransactions: React.FC<{ market: SportMarketInfo }> = ({ market }) => {
    const { t } = useTranslation();
    const language = i18n.language;
    const theme: ThemeInterface = useTheme();
    const selectedOddsType = useSelector(getOddsType);
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps>({
        markets: [],
        multiSingle: false,
        totalQuote: 0,
        paid: 0,
        payout: 0,
        onClose: () => {},
    });
    const parlaysTxQuery = useMarketParlaysQuery(market, networkId);

    const parlayTx = useMemo(() => {
        let _parlayTx;

        if (parlaysTxQuery.data && parlaysTxQuery.isSuccess) {
            _parlayTx = parlaysTxQuery.data ? parlaysTxQuery.data : [];
        }

        return _parlayTx;
    }, [parlaysTxQuery.data, parlaysTxQuery.isSuccess]);

    const onTwitterIconClick = (data: any) => {
        const sportMarkets: SportMarketInfo[] = data.sportMarkets;

        const parlaysMarket: ParlaysMarket[] = sportMarkets
            .map((sportMarket) => {
                const sportMarketFromContractIndex = data.sportMarketsFromContract.findIndex(
                    (address: string) => address === sportMarket.address
                );
                const position: Position = Number(data.positionsFromContract[sportMarketFromContractIndex]);

                // Update odds with values from contract when position was bought
                const sportMarketWithBuyQuotes = {
                    ...sportMarket,
                    homeOdds:
                        position === Position.HOME
                            ? sportMarket.isCanceled
                                ? 1
                                : data.marketQuotes[sportMarketFromContractIndex]
                            : sportMarket.homeOdds,
                    drawOdds:
                        position === Position.DRAW
                            ? sportMarket.isCanceled
                                ? 1
                                : data.marketQuotes[sportMarketFromContractIndex]
                            : sportMarket.drawOdds,
                    awayOdds:
                        position === Position.AWAY
                            ? sportMarket.isCanceled
                                ? 1
                                : data.marketQuotes[sportMarketFromContractIndex]
                            : sportMarket.awayOdds,
                };

                const positionsIndex = data.positions.findIndex(
                    (positionData: PositionData) => positionData.market.address === sportMarket.address
                );

                return {
                    ...sportMarketWithBuyQuotes,
                    position,
                    winning: getMarketWinStatus(data.positions[positionsIndex]),
                };
            })
            .sort(
                (a, b) =>
                    data.sportMarketsFromContract.findIndex((address: string) => address === a.address) -
                    data.sportMarketsFromContract.findIndex((address: string) => address === b.address)
            );

        const modalData: ShareTicketModalProps = {
            markets: parlaysMarket,
            multiSingle: false,
            totalQuote: data.totalQuote,
            paid: data.sUSDPaid,
            payout: data.totalAmount,
            onClose: () => setShowShareTicketModal(false),
        };
        setShareTicketModalData(modalData);
        setShowShareTicketModal(true);
    };

    return (
        <Container>
            <Title>{t('market.table.parlay-title')}</Title>
            <Table
                tableHeight="calc(100% - 68px)"
                tableHeadCellStyles={{
                    ...TableHeaderStyle,
                    color: theme.textColor.secondary,
                }}
                tableRowCellStyles={TableRowStyle}
                columnsDeps={[networkId]}
                columns={[
                    {
                        id: 'time',
                        Header: <>{t('profile.table.time')}</>,
                        accessor: 'timestamp',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatTxTimestamp(cellProps.cell.value)}</TableText>;
                        },
                    },
                    {
                        id: 'id',
                        Header: <>{t('profile.table.id')}</>,
                        accessor: 'id',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                <FlexCenter>
                                    <SPAAnchor
                                        href={getEtherscanTxLink(
                                            networkId,
                                            (cellProps.row.original as ParlayMarket).txHash
                                        )}
                                    >
                                        <TableText>{truncateAddress(cellProps.cell.value)}</TableText>
                                    </SPAAnchor>
                                </FlexCenter>
                            );
                        },
                    },
                    {
                        id: 'position',
                        Header: <>{t('profile.table.games')}</>,
                        accessor: 'positions',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            const parlay = syncPositionsAndMarketsPerContractOrderInParlay(
                                cellProps.row.original as ParlayMarket
                            );
                            const combinedMarkets = extractCombinedMarketsFromParlayMarketType(parlay);
                            const numberOfMarketsModifiedWithCombinedPositions =
                                combinedMarkets.length > 0
                                    ? parlay.sportMarkets.length - combinedMarkets.length
                                    : parlay.sportMarkets.length;
                            return (
                                <FlexCenter>
                                    <TableText>{numberOfMarketsModifiedWithCombinedPositions}</TableText>
                                </FlexCenter>
                            );
                        },
                    },
                    {
                        id: 'paid',
                        Header: <>{t('profile.table.paid')}</>,
                        accessor: 'sUSDPaid',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                <TableText>
                                    {formatCurrencyWithKey(getDefaultCollateral(networkId), cellProps.cell.value, 2)}
                                </TableText>
                            );
                        },
                    },
                    {
                        id: 'amount',
                        Header: <>{t('profile.table.amount')}</>,
                        accessor: 'totalAmount',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>;
                        },
                    },
                    {
                        id: 'status',
                        Header: <>{t('profile.table.status')}</>,
                        sortable: false,
                        Cell: (cellProps: any) => {
                            if (isParlayWon(cellProps.row.original)) {
                                return <StatusWrapper color={theme.status.win}>WON </StatusWrapper>;
                            } else {
                                return isParlayOpen(cellProps.row.original) ? (
                                    <StatusWrapper color={theme.status.open}>OPEN</StatusWrapper>
                                ) : (
                                    <StatusWrapper color={theme.status.loss}>LOSS</StatusWrapper>
                                );
                            }
                        },
                    },
                ]}
                initialState={{
                    sortBy: [
                        {
                            id: 'time',
                            desc: true,
                        },
                    ],
                }}
                isLoading={parlaysTxQuery?.isLoading}
                data={parlayTx ?? []}
                noResultsMessage={t('market.table.no-results')}
                expandedRow={(row) => {
                    const parlay = syncPositionsAndMarketsPerContractOrderInParlay(row.original as ParlayMarket);

                    const combinedMarkets = extractCombinedMarketsFromParlayMarketType(parlay);
                    const parlayWithoutCombinedMarkets = removeCombinedMarketsFromParlayMarketType(parlay);

                    const toRender = getParlayRow(
                        parlayWithoutCombinedMarkets,
                        selectedOddsType,
                        language,
                        theme,
                        combinedMarkets,
                        market
                    );

                    return (
                        <ExpandedRowWrapper>
                            <FirstExpandedSection>{toRender}</FirstExpandedSection>
                            <LastExpandedSection>
                                <QuoteWrapper>
                                    <QuoteLabel>{t('profile.table.total-quote')}:</QuoteLabel>
                                    <QuoteText>
                                        {formatParlayOdds(
                                            selectedOddsType,
                                            row.original.sUSDPaid,
                                            row.original.totalAmount
                                        )}
                                    </QuoteText>
                                </QuoteWrapper>
                                <QuoteWrapper>
                                    <QuoteLabel>{t('profile.table.total-amount')}:</QuoteLabel>
                                    <QuoteText>
                                        {formatCurrencyWithKey(USD_SIGN, row.original.totalAmount, 2)}
                                    </QuoteText>
                                </QuoteWrapper>
                                <TwitterWrapper>
                                    <TwitterIcon fontSize={'15px'} onClick={() => onTwitterIconClick(row.original)} />
                                </TwitterWrapper>
                            </LastExpandedSection>
                        </ExpandedRowWrapper>
                    );
                }}
            ></Table>
            {showShareTicketModal && (
                <ShareTicketModal
                    markets={shareTicketModalData.markets}
                    multiSingle={false}
                    totalQuote={shareTicketModalData.totalQuote}
                    paid={shareTicketModalData.paid}
                    payout={shareTicketModalData.payout}
                    onClose={shareTicketModalData.onClose}
                />
            )}
        </Container>
    );
};

const getMarketWinStatus = (position: PositionData) =>
    position.market.isResolved && !position.market.isCanceled
        ? convertPositionNameToPosition(position.side) === convertFinalResultToResultType(position.market.finalResult)
        : undefined; // open or canceled

const getPositionStatus = (position: PositionData, theme: ThemeInterface) => {
    const winStatus = getMarketWinStatus(position);

    return winStatus === undefined ? (
        <StatusIcon color={theme.status.open} className={`icon icon--open`} />
    ) : winStatus ? (
        <StatusIcon color={theme.status.win} className={`icon icon--win`} />
    ) : (
        <StatusIcon color={theme.status.loss} className={`icon icon--lost`} />
    );
};

export const getPositionStatusForCombinedMarket = (combinedMarket: CombinedMarket, theme: ThemeInterface) => {
    const isOpen = combinedMarket.markets[0].isOpen || combinedMarket.markets[1].isOpen;
    if (isOpen) return <StatusIcon color={theme.status.open} className={`icon icon--open`} />;
    if (isCombinedMarketWinner(combinedMarket.markets, combinedMarket.positions))
        return <StatusIcon color={theme.status.win} className={`icon icon--win`} />;
    return <StatusIcon color={theme.status.loss} className={`icon icon--lost`} />;
};

const getOpacity = (position: PositionData) => {
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

export const getOpacityForCombinedMarket = (combinedMarket: CombinedMarket) => {
    if (isCombinedMarketWinner(combinedMarket.markets, combinedMarket.positions)) return 1;
    if (combinedMarket.markets[0].isResolved && combinedMarket.markets[1].isResolved) return 0.5;
    return 1;
};

const getParlayItemStatus = (market: SportMarketInfo) => {
    if (market.isCanceled) return t('profile.card.canceled');
    if (market.isResolved) {
        if (market.playerName !== null) {
            return market.playerPropsScore;
        }
        return `${market.homeScore} : ${market.awayScore}`;
    }
    return formatDateWithTime(Number(market.maturityDate));
};

const StatusIcon = styled.i`
    font-size: 14px;
    margin-right: 4px;
    &::before {
        color: ${(props) => props.color || 'white'};
    }
`;

export const getParlayRow = (
    data: ParlayMarketWithQuotes,
    selectedOddsType: OddsType,
    language: string,
    theme: ThemeInterface,
    combinedMarkets?: CombinedMarket[],
    parentMarket?: SportMarketInfo
) => {
    const render: any = [];
    if (combinedMarkets?.length) {
        combinedMarkets.forEach((combinedMarket, index) => {
            const opacity = getOpacityForCombinedMarket(combinedMarket);
            const odd = formatMarketOdds(selectedOddsType, combinedMarket.totalOdd ? combinedMarket.totalOdd : 1);
            const symbolText = getCombinedPositionName(combinedMarket.markets, combinedMarket.positions);

            const homeTeam = combinedMarket.markets[0].homeTeam;
            const awayTeam = combinedMarket.markets[1].awayTeam;

            const positionStatus = getPositionStatusForCombinedMarket(combinedMarket, theme);

            const tooltipText = getCombinedOddTooltipText(combinedMarket.markets, combinedMarket.positions);

            const spreadAndTotalValues = getSpreadAndTotalTextForCombinedMarket(
                combinedMarket.markets,
                combinedMarket.positions
            );
            const spreadAndTotalText = `${spreadAndTotalValues.spread ? spreadAndTotalValues.spread + '/' : ''}${
                spreadAndTotalValues.total ? spreadAndTotalValues.total : ''
            }`;

            render.push(
                <ParlayRow
                    highlighted={
                        combinedMarket.markets[0].address === parentMarket?.address ||
                        combinedMarket.markets[1].address === parentMarket?.address
                    }
                    style={{ opacity: opacity }}
                    key={`$cm-${index}`}
                >
                    <ParlayRowText style={{ cursor: 'pointer' }}>
                        {positionStatus}
                        <ParlayRowTeam>{homeTeam + ' vs ' + awayTeam}</ParlayRowTeam>
                    </ParlayRowText>
                    <PositionSymbol
                        symbolAdditionalText={{
                            text: odd,
                            textStyle: {
                                fontSize: '10.5px',
                                marginLeft: '10px',
                            },
                        }}
                        additionalStyle={{ width: 23, height: 23, fontSize: 10.5, borderWidth: 2 }}
                        symbolText={symbolText ? symbolText : ''}
                        symbolUpperText={
                            spreadAndTotalText
                                ? {
                                      text: spreadAndTotalText,
                                      textStyle: {
                                          backgroundColor: theme.background.primary,
                                          fontSize: '10px',
                                          top: '-9px',
                                          left: '10px',
                                      },
                                  }
                                : undefined
                        }
                        tooltip={<>{tooltipText}</>}
                    />
                    <QuoteText>{getParlayItemStatus(combinedMarket.markets[0])}</QuoteText>
                </ParlayRow>
            );
        });
    }

    if (!data.sportMarkets?.length) return render;

    data.positions.forEach((position, index) => {
        const quote = data.sportMarkets[index]?.isCanceled ? 1 : data.marketQuotes ? data.marketQuotes[index] : 0;
        const positionEnum = convertPositionNameToPositionType(position ? position.side : '');

        const symbolText = getSymbolText(positionEnum, position.market);
        const spreadTotalText = getSpreadTotalText(position.market, positionEnum);

        render.push(
            <ParlayRow
                highlighted={
                    position.market.address === parentMarket?.address ||
                    !!parentMarket?.childMarkets.find((childMarket) => childMarket.address === position.market.address)
                }
                style={{ opacity: getOpacity(position) }}
                key={`m-${index}`}
            >
                <SPAAnchor
                    href={buildMarketLink(
                        getParentMarketAddress(position.market.parentMarket, position.market.address),
                        language
                    )}
                >
                    <ParlayRowText style={{ cursor: 'pointer' }}>
                        {getPositionStatus(position, theme)}
                        <ParlayRowTeam>
                            {position.market.isOneSideMarket
                                ? fixOneSideMarketCompetitorName(position.market.homeTeam)
                                : position.market.playerName === null
                                ? position.market.homeTeam + ' vs ' + position.market.awayTeam
                                : `${position.market.playerName} (${
                                      BetTypeNameMap[position.market.betType as BetType]
                                  }) `}
                        </ParlayRowTeam>
                    </ParlayRowText>
                </SPAAnchor>
                <PositionSymbol
                    symbolAdditionalText={{
                        text: formatMarketOdds(selectedOddsType, quote),
                        textStyle: {
                            fontSize: '10.5px',
                            marginLeft: '10px',
                        },
                    }}
                    additionalStyle={{ width: 23, height: 23, fontSize: 10.5, borderWidth: 2 }}
                    symbolText={symbolText}
                    symbolUpperText={
                        spreadTotalText &&
                        !isOneSidePlayerProps(position.market.betType) &&
                        !isSpecialYesNoProp(position.market.betType)
                            ? {
                                  text: spreadTotalText,
                                  textStyle: {
                                      backgroundColor: theme.background.primary,
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

    return render;
};

const Title = styled.span`
    display: block;
    width: 100%;
    font-style: normal;
    font-weight: bold;
    font-size: 18px;
    line-height: 100%;
    text-align: center;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 10px;
`;

const TableText = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    text-align: left;
    @media (max-width: 600px) {
        font-size: 10px;
        white-space: pre-wrap;
    }
    white-space: nowrap;
`;

const StatusWrapper = styled.div`
    width: 62px;
    height: 25px;
    border: 2px solid ${(props) => props.color || props.theme.status.open};
    border-radius: 5px;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 16px;
    text-align: justify;
    text-transform: uppercase;
    text-align: center;
    color: ${(props) => props.color || props.theme.status.open};
    padding-top: 3px;
`;

const QuoteText = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 10px;
    text-align: left;
    white-space: nowrap;
`;

const QuoteLabel = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 10px;

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

const FlexCenter = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ExpandedRowWrapper = styled.div`
    display: flex;
    padding-left: 30px;
    @media (max-width: 600px) {
        flex-direction: column;
        padding-left: 10px;
        padding-right: 10px;
    }
    @media (max-width: 400px) {
        padding: 0;
    }
    border-bottom: 2px dotted ${(props) => props.theme.borderColor.primary};
`;

const ParlayRow = styled(FlexDivRowCentered)<{ highlighted?: boolean }>`
    margin-top: 10px;
    background: ${(props) => (props.highlighted ? props.theme.background.secondary : 'initial')};
    border-radius: 10px;
    & > div {
        flex: 1;
    }
    &:last-child {
        margin-bottom: 10px;
    }
`;

const ParlayRowText = styled(QuoteText)`
    max-width: 220px;
    width: 300px;
    display: flex;
    align-items: center;
`;

const ParlayRowTeam = styled.span`
    white-space: nowrap;
    width: 190px;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const FirstExpandedSection = styled(FlexDivColumnCentered)`
    flex: 2;
`;

const LastExpandedSection = styled(FlexDivColumnCentered)`
    position: relative;
    flex: 1;
    gap: 20px;
    @media (max-width: 600px) {
        flex-direction: row;
        margin: 10px 0;
    }
`;

const TwitterWrapper = styled.div`
    position: absolute;
    bottom: 10px;
    right: 5px;
    @media (max-width: 600px) {
        bottom: -2px;
        right: 2px;
    }
`;

export default ParlayTransactions;
