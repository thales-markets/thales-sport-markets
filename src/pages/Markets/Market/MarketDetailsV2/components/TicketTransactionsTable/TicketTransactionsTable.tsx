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
import React, { useState } from 'react';
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
    getEtherscanAddressLink,
    truncateAddress,
} from 'thales-utils';
import { ParlaysMarket, PositionData, SportMarketInfo, SportMarketInfoV2, Ticket, TicketMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { getDefaultCollateral } from 'utils/collaterals';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { formatMarketOdds, getLineInfoV2, getOddTooltipTextV2, getSymbolTextV2 } from 'utils/markets';
import { formatParlayOdds } from 'utils/parlay';
import { buildMarketLink } from 'utils/routes';

type TicketTransactionsTableProps = {
    ticketTransactions: Ticket[];
    market?: SportMarketInfoV2;
    tableHeight?: string;
    isLoading: boolean;
};

const TicketTransactionsTable: React.FC<TicketTransactionsTableProps> = ({
    ticketTransactions,
    market,
    tableHeight,
    isLoading,
}) => {
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
        <>
            <Table
                tableHeight={tableHeight}
                tableHeadCellStyles={{
                    ...TableHeaderStyle,
                    color: theme.textColor.secondary,
                }}
                tableRowCellStyles={TableRowStyle}
                columnsDeps={[networkId]}
                columns={[
                    {
                        Header: <>{t('profile.table.time')}</>,
                        accessor: 'timestamp',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatTxTimestamp(cellProps.cell.value)}</TableText>;
                        },
                    },
                    {
                        Header: <>{t('profile.table.id')}</>,
                        accessor: 'id',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                <ExternalLink
                                    href={getEtherscanAddressLink(networkId, cellProps.cell.value)}
                                    target={'_blank'}
                                >
                                    <FlexCenter>
                                        <TableText>{truncateAddress(cellProps.cell.value)}</TableText>
                                    </FlexCenter>
                                </ExternalLink>
                            );
                        },
                    },
                    {
                        Header: <>{t('profile.table.games')}</>,
                        accessor: 'numOfGames',
                        sortable: true,
                        Cell: (cellProps: any) => {
                            return (
                                <FlexCenter>
                                    <TableText>{cellProps.cell.value}</TableText>
                                </FlexCenter>
                            );
                        },
                    },
                    {
                        Header: <>{t('profile.table.paid')}</>,
                        accessor: 'buyInAmount',
                        sortable: true,
                        Cell: (cellProps: any) => {
                            return (
                                <TableText>
                                    {formatCurrencyWithKey(getDefaultCollateral(networkId), cellProps.cell.value, 2)}
                                </TableText>
                            );
                        },
                    },
                    {
                        Header: <>{t('profile.table.amount')}</>,
                        accessor: 'payout',
                        sortable: true,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>;
                        },
                    },
                    {
                        Header: <>{t('profile.table.status')}</>,
                        accessor: 'status',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            if (cellProps.row.original.isCancelled) {
                                return <StatusWrapper color={theme.status.sold}>CANCELED</StatusWrapper>;
                            } else if (cellProps.row.original.isUserTheWinner) {
                                return <StatusWrapper color={theme.status.win}>WON</StatusWrapper>;
                            } else {
                                return cellProps.row.original.isLost ? (
                                    <StatusWrapper color={theme.status.loss}>LOSS</StatusWrapper>
                                ) : (
                                    <StatusWrapper color={theme.status.open}>OPEN</StatusWrapper>
                                );
                            }
                        },
                    },
                ]}
                initialState={{
                    sortBy: [
                        {
                            id: 'timestamp',
                            desc: true,
                        },
                    ],
                }}
                isLoading={isLoading}
                data={ticketTransactions ?? []}
                noResultsMessage={t('market.table.no-results')}
                expandedRow={(row) => {
                    const toRender = getParlayRow(row.original, selectedOddsType, language, theme, market);

                    return (
                        <ExpandedRowWrapper>
                            <FirstExpandedSection>{toRender}</FirstExpandedSection>
                            <LastExpandedSection>
                                <QuoteWrapper>
                                    <QuoteLabel>{t('profile.table.total-quote')}:</QuoteLabel>
                                    <QuoteText>
                                        {formatParlayOdds(
                                            selectedOddsType,
                                            row.original.buyInAmount,
                                            row.original.payout
                                        )}
                                    </QuoteText>
                                </QuoteWrapper>
                                <QuoteWrapper>
                                    <QuoteLabel>{t('profile.table.total-amount')}:</QuoteLabel>
                                    <QuoteText>{formatCurrencyWithKey(USD_SIGN, row.original.payout, 2)}</QuoteText>
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
        </>
    );
};

const getMarketWinStatus = (market: TicketMarket) =>
    market.isResolved && !market.isCanceled ? market.position + 1 === market.finalResult : undefined; // open or canceled

const getTicketMarketStatusIcon = (market: TicketMarket, theme: ThemeInterface) => {
    const winStatus = getMarketWinStatus(market);

    return winStatus === undefined ? (
        <StatusIcon color={theme.status.open} className={`icon icon--open`} />
    ) : winStatus ? (
        <StatusIcon color={theme.status.win} className={`icon icon--win`} />
    ) : (
        <StatusIcon color={theme.status.loss} className={`icon icon--lost`} />
    );
};

const getTicketMarketStatus = (market: TicketMarket) => {
    if (market.isCanceled) return t('profile.card.canceled');
    if (market.isResolved) {
        if (market.isPlayerPropsMarket) {
            return market.playerProps.score;
        }
        return `${market.homeScore} : ${market.awayScore}`;
    }
    return formatDateWithTime(Number(market.maturityDate));
};

const getOpacity = (market: TicketMarket) => {
    if (market.isResolved) {
        if (market.position + 1 === market.finalResult) {
            return 1;
        } else {
            return 0.5;
        }
    } else {
        return 1;
    }
};

const StatusIcon = styled.i`
    font-size: 14px;
    margin-right: 4px;
    &::before {
        color: ${(props) => props.color || 'white'};
    }
`;

export const getParlayRow = (
    ticket: Ticket,
    selectedOddsType: OddsType,
    language: string,
    theme: ThemeInterface,
    market?: SportMarketInfoV2
) => {
    const render: any = [];
    if (!ticket.sportMarkets.length) return render;

    ticket.sportMarkets.forEach((ticketMarket, index) => {
        const quote = ticketMarket.isCanceled ? 1 : ticketMarket.odd;

        const symbolText = getSymbolTextV2(ticketMarket.position, ticketMarket);
        const lineInfo = getLineInfoV2(ticketMarket, ticketMarket.position);

        render.push(
            <ParlayRow
                highlighted={market && ticketMarket.gameId === market.gameId}
                style={{ opacity: getOpacity(ticketMarket) }}
                key={`m-${index}`}
            >
                <SPAAnchor href={buildMarketLink(ticketMarket.gameId, language)}>
                    <ParlayRowText style={{ cursor: 'pointer' }}>
                        {getTicketMarketStatusIcon(ticketMarket, theme)}
                        <ParlayRowTeam>
                            {ticketMarket.isOneSideMarket
                                ? fixOneSideMarketCompetitorName(ticketMarket.homeTeam)
                                : !ticketMarket.isPlayerPropsMarket
                                ? ticketMarket.homeTeam + ' vs ' + ticketMarket.awayTeam
                                : `${ticketMarket.playerProps.playerName} (${
                                      BetTypeNameMap[ticketMarket.typeId as BetType]
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
                        lineInfo && !ticketMarket.isOneSidePlayerPropsMarket && !ticketMarket.isYesNoPlayerPropsMarket
                            ? {
                                  text: lineInfo,
                                  textStyle: {
                                      backgroundColor: theme.background.primary,
                                      fontSize: '10px',
                                      top: '-9px',
                                      left: '10px',
                                  },
                              }
                            : undefined
                    }
                    tooltip={<>{getOddTooltipTextV2(ticketMarket.position, ticketMarket)}</>}
                />
                <QuoteText>{getTicketMarketStatus(ticketMarket)}</QuoteText>
            </ParlayRow>
        );
    });

    return render;
};

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
    min-width: 62px;
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
    padding: 3px 4px 0 4px;
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
    gap: 10px;
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

export const ExternalLink = styled.a`
    color: ${(props) => props.theme.link.textColor.secondary};
`;

export default TicketTransactionsTable;
