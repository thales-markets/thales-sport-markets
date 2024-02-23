import PositionSymbol from 'components/PositionSymbol';
import SPAAnchor from 'components/SPAAnchor';
import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { BetTypeNameMap } from 'constants/tags';
import { BetType, OddsType } from 'enums/markets';
import i18n from 'i18n';
import { TwitterIcon } from 'pages/Markets/Home/Parlay/components/styled-components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getOddsType } from 'redux/modules/ui';
import { getNetworkId } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import {
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    formatTxTimestamp,
    getEtherscanAddressLink,
    truncateAddress,
} from 'thales-utils';
import { SportMarketInfoV2, Ticket, TicketMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { getDefaultCollateral } from 'utils/collaterals';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { formatMarketOdds, getLineInfoV2, getOddTooltipTextV2, getSymbolTextV2 } from 'utils/markets';
import { formatParlayOdds } from 'utils/parlay';
import { buildMarketLink } from 'utils/routes';
import {
    getTicketMarketOdd,
    getTicketMarketStatus,
    getTicketMarketWinStatus,
    isWinningTicketMarket,
} from 'utils/tickets';
import ShareTicketModalV2 from '../../../../Home/Parlay/components/ShareTicketModalV2';
import { ShareTicketModalProps } from '../../../../Home/Parlay/components/ShareTicketModalV2/ShareTicketModalV2';
import {
    ExpandedRowWrapper,
    ExternalLink,
    FirstExpandedSection,
    LastExpandedSection,
    QuoteLabel,
    QuoteText,
    QuoteWrapper,
    StatusIcon,
    StatusWrapper,
    TableHeaderStyle,
    TableRowStyle,
    TableText,
    TicketRow,
    TicketRowTeam,
    TicketRowText,
    TwitterWrapper,
} from './styled-components';

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
    const networkId = useSelector(getNetworkId);

    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps | undefined>(undefined);

    const onTwitterIconClick = (ticket: Ticket) => {
        ticket.sportMarkets = ticket.sportMarkets.map((sportMarket) => {
            return {
                ...sportMarket,
                odd: getTicketMarketOdd(sportMarket),
                winning: getTicketMarketWinStatus(sportMarket),
            };
        });

        const modalData: ShareTicketModalProps = {
            markets: ticket.sportMarkets,
            multiSingle: false,
            paid: ticket.buyInAmount,
            payout: ticket.payout,
            onClose: () => setShowShareTicketModal(false),
            isTicketLost: ticket.isLost,
            isTicketResolved: !ticket.isOpen,
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
                                    <TableText>{truncateAddress(cellProps.cell.value)}</TableText>
                                </ExternalLink>
                            );
                        },
                    },
                    {
                        Header: <>{t('profile.table.games')}</>,
                        accessor: 'numOfGames',
                        sortable: true,
                        Cell: (cellProps: any) => {
                            return <TableText>{cellProps.cell.value}</TableText>;
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
                data={ticketTransactions}
                noResultsMessage={t('market.table.no-results')}
                expandedRow={(row) => {
                    const ticketMarkets = getTicketMarkets(row.original, selectedOddsType, language, theme, market);

                    return (
                        <ExpandedRowWrapper>
                            <FirstExpandedSection>{ticketMarkets}</FirstExpandedSection>
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
            {showShareTicketModal && shareTicketModalData && (
                <ShareTicketModalV2
                    markets={shareTicketModalData.markets}
                    multiSingle={false}
                    paid={shareTicketModalData.paid}
                    payout={shareTicketModalData.payout}
                    onClose={shareTicketModalData.onClose}
                    isTicketLost={shareTicketModalData.isTicketLost}
                    isTicketResolved={shareTicketModalData.isTicketResolved}
                />
            )}
        </>
    );
};

const getTicketMarketStatusIcon = (market: TicketMarket, theme: ThemeInterface) => {
    const winStatus = getTicketMarketWinStatus(market);

    return winStatus === undefined ? (
        <StatusIcon color={theme.status.open} className={`icon icon--open`} />
    ) : winStatus ? (
        <StatusIcon color={theme.status.win} className={`icon icon--win`} />
    ) : (
        <StatusIcon color={theme.status.loss} className={`icon icon--lost`} />
    );
};

const getOpacity = (market: TicketMarket) => (market.isResolved && isWinningTicketMarket(market) ? 0.5 : 1);

export const getTicketMarkets = (
    ticket: Ticket,
    selectedOddsType: OddsType,
    language: string,
    theme: ThemeInterface,
    market?: SportMarketInfoV2
) => {
    return ticket.sportMarkets.map((ticketMarket, index) => {
        const quote = getTicketMarketOdd(ticketMarket);
        const symbolText = getSymbolTextV2(ticketMarket.position, ticketMarket);
        const lineInfo = getLineInfoV2(ticketMarket, ticketMarket.position);

        return (
            <TicketRow
                highlighted={market && ticketMarket.gameId === market.gameId}
                style={{ opacity: getOpacity(ticketMarket) }}
                key={`m-${index}`}
            >
                <SPAAnchor href={buildMarketLink(ticketMarket.gameId, language)}>
                    <TicketRowText style={{ cursor: 'pointer' }}>
                        {getTicketMarketStatusIcon(ticketMarket, theme)}
                        <TicketRowTeam>
                            {ticketMarket.isOneSideMarket
                                ? fixOneSideMarketCompetitorName(ticketMarket.homeTeam)
                                : !ticketMarket.isPlayerPropsMarket
                                ? ticketMarket.homeTeam + ' vs ' + ticketMarket.awayTeam
                                : `${ticketMarket.playerProps.playerName} (${
                                      BetTypeNameMap[ticketMarket.typeId as BetType]
                                  }) `}
                        </TicketRowTeam>
                    </TicketRowText>
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
            </TicketRow>
        );
    });
};

export default TicketTransactionsTable;
