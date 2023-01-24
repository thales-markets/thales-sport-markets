import PositionSymbol from 'components/PositionSymbol';
import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { useParlayMarketsQuery } from 'queries/markets/useParlayMarketsQuery';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getOddsType } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { ParlaysMarket, PositionData, SportMarketInfo } from 'types/markets';
import { formatDateWithTime, formatTxTimestamp } from 'utils/formatters/date';
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
    isParlayClaimable,
    isParlayOpen,
} from 'utils/markets';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { TwitterIcon } from 'pages/Markets/Home/Parlay/components/styled-components';
import ShareTicketModal from 'pages/Markets/Home/Parlay/components/ShareTicketModal';
import { ShareTicketModalProps } from 'pages/Markets/Home/Parlay/components/ShareTicketModal/ShareTicketModal';
import { Position } from 'constants/options';
import { ethers } from 'ethers';

const ParlayTransactions: React.FC<{ searchText?: string }> = ({ searchText }) => {
    const { t } = useTranslation();
    const selectedOddsType = useSelector(getOddsType);
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const isSearchTextWalletAddress = searchText && ethers.utils.isAddress(searchText);

    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps>({
        markets: [],
        totalQuote: 0,
        paid: 0,
        payout: 0,
        onClose: () => {},
    });

    const parlaysTxQuery = useParlayMarketsQuery(
        isSearchTextWalletAddress ? searchText : walletAddress.toLowerCase(),
        networkId,
        undefined,
        undefined,
        {
            enabled: isWalletConnected,
            refetchInterval: false,
        }
    );
    let parlayTx = parlaysTxQuery.isSuccess ? parlaysTxQuery.data : [];

    if (searchText && !isSearchTextWalletAddress) {
        parlayTx = parlayTx?.filter((item) => {
            const marketWithSearchTextIncluded = item.sportMarkets.find(
                (item) =>
                    item.homeTeam?.toLowerCase().includes(searchText.toLowerCase()) ||
                    item.awayTeam?.toLowerCase().includes(searchText.toLowerCase())
            );

            if (marketWithSearchTextIncluded) return item;
        });
    }

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
            totalQuote: data.totalQuote,
            paid: data.sUSDPaid,
            payout: data.totalAmount,
            onClose: () => setShowShareTicketModal(false),
        };
        setShareTicketModalData(modalData);
        setShowShareTicketModal(true);
    };

    return (
        <>
            <Table
                tableHeadCellStyles={TableHeaderStyle}
                tableRowCellStyles={TableRowStyle}
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
                                    <TableText>{truncateAddress(cellProps.cell.value)}</TableText>
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
                            return (
                                <FlexCenter>
                                    <TableText>{cellProps.cell.value.length}</TableText>
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
                            return <TableText>{formatCurrencyWithKey('sUSD', cellProps.cell.value, 2)}</TableText>;
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
                            if (cellProps.row.original.won || isParlayClaimable(cellProps.row.original)) {
                                return <StatusWrapper color="#5FC694">WON </StatusWrapper>;
                            } else {
                                return isParlayOpen(cellProps.row.original) ? (
                                    <StatusWrapper color="#FFFFFF">OPEN</StatusWrapper>
                                ) : (
                                    <StatusWrapper color="#E26A78">LOSS</StatusWrapper>
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
                noResultsMessage={t('profile.messages.no-transactions')}
                expandedRow={(row) => {
                    const toRender = row.original.sportMarketsFromContract.map((address: string, index: number) => {
                        const position = row.original.positions.find(
                            (position: any) => position.market.address == address
                        );
                        const market = row.original.sportMarkets.find(
                            (market: SportMarketInfo) => market.address == address
                        );
                        const positionEnum = convertPositionNameToPositionType(position ? position.side : '');

                        const quote = market?.isCanceled
                            ? 1
                            : row.original.marketQuotes
                            ? row.original.marketQuotes[index]
                            : 0;

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
                                        text: formatMarketOdds(selectedOddsType, quote),
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
                            <FirstExpandedSection>{toRender}</FirstExpandedSection>
                            <LastExpandedSection>
                                <QuoteWrapper>
                                    <QuoteLabel>{t('profile.table.total-quote')}:</QuoteLabel>
                                    <QuoteText>{formatMarketOdds(selectedOddsType, row.original.totalQuote)}</QuoteText>
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
                    totalQuote={shareTicketModalData.totalQuote}
                    paid={shareTicketModalData.paid}
                    payout={shareTicketModalData.payout}
                    onClose={shareTicketModalData.onClose}
                />
            )}
        </>
    );
};

const getMarketWinStatus = (position: PositionData) =>
    position.market.isResolved
        ? convertPositionNameToPosition(position.side) === convertFinalResultToResultType(position.market.finalResult)
        : undefined;

const getPositionStatus = (position: PositionData) => {
    const winStatus = getMarketWinStatus(position);

    return winStatus === undefined ? (
        <StatusIcon color="#FFFFFF" className={`icon icon--open`} />
    ) : winStatus ? (
        <StatusIcon color="#5FC694" className={`icon icon--win`} />
    ) : (
        <StatusIcon color="#E26A78" className={`icon icon--lost`} />
    );
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

const getParlayItemStatus = (market: SportMarketInfo) => {
    if (market.isCanceled) return t('profile.card.canceled');
    if (market.isResolved) return `${market.homeScore} : ${market.awayScore}`;
    return formatDateWithTime(Number(market.maturityDate) * 1000);
};

const StatusIcon = styled.i`
    font-size: 14px;
    margin-right: 4px;
    &::before {
        color: ${(props) => props.color || 'white'};
    }
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
    border: 2px solid ${(props) => props.color || 'white'};
    border-radius: 5px;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 16px;
    text-align: justify;
    text-transform: uppercase;
    text-align: center;
    color: ${(props) => props.color || 'white'};
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
    color: '#5F6180',
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
    border-bottom: 2px dotted rgb(95, 97, 128);
`;

const ParlayRow = styled(FlexDivRowCentered)`
    margin-top: 10px;
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
