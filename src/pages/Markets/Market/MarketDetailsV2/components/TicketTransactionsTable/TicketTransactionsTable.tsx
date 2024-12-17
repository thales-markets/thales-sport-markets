import SPAAnchor from 'components/SPAAnchor';
import ShareTicketModalV2 from 'components/ShareTicketModalV2';
import { ShareTicketModalProps } from 'components/ShareTicketModalV2/ShareTicketModalV2';
import Table from 'components/Table';
import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { OddsType } from 'enums/markets';
import i18n from 'i18n';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getOddsType } from 'redux/modules/ui';
import { useTheme } from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import {
    Coins,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    formatDateWithTime,
    getEtherscanAddressLink,
    truncateAddress,
} from 'thales-utils';
import { Rates } from 'types/collateral';
import { SportMarket, Ticket, TicketMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { getDefaultCollateral } from 'utils/collaterals';
import { formatMarketOdds } from 'utils/markets';
import { getMatchTeams, getPositionTextV2, getTeamNameV2, getTitleText } from 'utils/marketsV2';
import { buildMarketLink } from 'utils/routes';
import { formatTicketOdds, getTicketMarketOdd, getTicketMarketStatus, tableSortByStatus } from 'utils/tickets';
import { useChainId, useClient } from 'wagmi';
import {
    ExpandedRowWrapper,
    ExternalLink,
    FirstExpandedSection,
    FreeBetIcon,
    LastExpandedSection,
    LiveIndicatorContainer,
    LiveLabel,
    MarketStatus,
    MarketStatusIcon,
    MarketTypeInfo,
    MatchTeamsLabel,
    Odd,
    PositionInfo,
    PositionText,
    QuoteLabel,
    QuoteText,
    QuoteWrapper,
    SelectionInfoContainer,
    StatusIcon,
    StatusWrapper,
    TableText,
    TeamNameLabel,
    TeamNamesContainer,
    TicketRow,
    TwitterIcon,
    TwitterWrapper,
    tableHeaderStyle,
    tableRowStyle,
} from './styled-components';

type TicketTransactionsTableProps = {
    ticketTransactions: Ticket[];
    market?: SportMarket;
    tableHeight?: string;
    isLoading: boolean;
    ticketsPerPage?: number;
    expandAll?: boolean;
};

const TicketTransactionsTable: React.FC<TicketTransactionsTableProps> = ({
    ticketTransactions,
    market,
    tableHeight,
    isLoading,
    ticketsPerPage,
    expandAll,
}) => {
    const { t } = useTranslation();
    const language = i18n.language;
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector(getIsMobile);
    const selectedOddsType = useSelector(getOddsType);

    const networkId = useChainId();
    const client = useClient();

    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps | undefined>(undefined);

    const exchangeRatesQuery = useExchangeRatesQuery({ networkId, client });
    const exchangeRates: Rates | undefined =
        exchangeRatesQuery.isSuccess && exchangeRatesQuery.data ? exchangeRatesQuery.data : undefined;

    const defaultCollateral = getDefaultCollateral(networkId);
    const getValueInUsd = (collateral: Coins, value: number) => {
        if (defaultCollateral === collateral) {
            return value;
        }
        return (!!exchangeRates ? exchangeRates[collateral] || 1 : 1) * value;
    };

    const onTwitterIconClick = (ticket: Ticket) => {
        ticket.sportMarkets = ticket.sportMarkets.map((sportMarket) => {
            return {
                ...sportMarket,
                odd: getTicketMarketOdd(sportMarket),
            };
        });

        const modalData: ShareTicketModalProps = {
            markets: ticket.sportMarkets,
            multiSingle: false,
            paid: ticket.buyInAmount,
            payout: ticket.payout,
            onClose: () => setShowShareTicketModal(false),
            isTicketLost: ticket.isLost,
            collateral: ticket.collateral,
            isLive: ticket.isLive,
            applyPayoutMultiplier: false,
        };
        setShareTicketModalData(modalData);
        setShowShareTicketModal(true);
    };

    const columns = [
        {
            header: <>{t('profile.table.time')}</>,
            accessorKey: 'timestamp',
            enableSorting: true,
            sortDescFirst: true,
            cell: (cellProps: any) => {
                return (
                    <>
                        <LiveIndicatorContainer isLive={cellProps.row.original.isLive}>
                            {cellProps.row.original.isLive && <LiveLabel>{t('profile.card.live')}</LiveLabel>}
                        </LiveIndicatorContainer>
                        <TableText>{formatDateWithTime(cellProps.cell.getValue())}</TableText>
                    </>
                );
            },
        },
        {
            header: <>{t('profile.table.id')}</>,
            accessorKey: 'id',
            enableSorting: false,
            cell: (cellProps: any) => {
                return (
                    <ExternalLink
                        href={getEtherscanAddressLink(networkId, cellProps.cell.getValue())}
                        target={'_blank'}
                    >
                        <TableText>{truncateAddress(cellProps.cell.getValue())}</TableText>
                    </ExternalLink>
                );
            },
        },
        {
            header: <>{t('profile.table.games')}</>,
            accessorKey: 'numOfMarkets',
            enableSorting: true,
            cell: (cellProps: any) => {
                return <TableText>{cellProps.cell.getValue()}</TableText>;
            },
        },
        {
            header: <>{t('profile.table.paid')}</>,
            accessorKey: 'buyInAmount',
            enableSorting: true,
            cell: (cellProps: any) => {
                return (
                    <Tooltip
                        overlay={formatCurrencyWithSign(
                            USD_SIGN,
                            getValueInUsd(cellProps.row.original.collateral, cellProps.cell.getValue())
                        )}
                    >
                        <TableText>
                            {formatCurrencyWithKey(cellProps.row.original.collateral, cellProps.cell.getValue())}
                        </TableText>
                    </Tooltip>
                );
            },
            sortType: (rowA: any, rowB: any) => {
                return (
                    getValueInUsd(rowA.original.collateral, rowA.original.buyInAmount) -
                    getValueInUsd(rowB.original.collateral, rowB.original.buyInAmount)
                );
            },
            sortDescFirst: true,
        },
        {
            header: <>{t('profile.table.payout')}</>,
            accessorKey: 'payout',
            enableSorting: true,
            cell: (cellProps: any) => {
                return (
                    <Tooltip
                        overlay={formatCurrencyWithSign(
                            USD_SIGN,
                            getValueInUsd(cellProps.row.original.collateral, cellProps.cell.getValue())
                        )}
                    >
                        <TableText>
                            {formatCurrencyWithKey(cellProps.row.original.collateral, cellProps.cell.getValue())}
                        </TableText>
                    </Tooltip>
                );
            },
            sortType: (rowA: any, rowB: any) => {
                return (
                    getValueInUsd(rowA.original.collateral, rowA.original.payout) -
                    getValueInUsd(rowB.original.collateral, rowB.original.payout)
                );
            },
            sortDescFirst: true,
        },
        {
            header: <p>{t('profile.table.status')}</p>,
            accessorKey: 'status',
            enableSorting: true,
            cell: (cellProps: any) => {
                let statusComponent;
                if (cellProps.row.original.isCancelled) {
                    statusComponent = (
                        <StatusWrapper color={theme.status.sold}>
                            <StatusIcon className={`icon icon--lost`} />
                            {t('markets.market-card.canceled')}
                        </StatusWrapper>
                    );
                } else if (cellProps.row.original.isUserTheWinner) {
                    statusComponent = (
                        <StatusWrapper color={theme.status.win}>
                            <StatusIcon className={`icon icon--ticket-win`} />
                            {t('markets.market-card.won')}
                        </StatusWrapper>
                    );
                } else {
                    statusComponent = cellProps.row.original.isLost ? (
                        <StatusWrapper color={theme.status.loss}>
                            <StatusIcon className={`icon icon--ticket-loss`} />
                            {t('markets.market-card.loss')}
                        </StatusWrapper>
                    ) : (
                        <StatusWrapper color={theme.status.open}>
                            <StatusIcon className={`icon icon--ticket-open`} />
                            {t('markets.market-card.open')}
                        </StatusWrapper>
                    );
                }

                if (cellProps.row.original.isFreeBet) {
                    return (
                        <>
                            <Tooltip overlay={t('profile.free-bet.claim-btn')}>
                                <FreeBetIcon className={'icon icon--gift'} />
                            </Tooltip>
                            {statusComponent}
                        </>
                    );
                }
                return statusComponent;
            },
            sortType: tableSortByStatus,
        },
    ];

    return (
        <>
            <Table
                tableHeight={tableHeight}
                tableHeadCellStyles={{
                    ...tableHeaderStyle,
                    color: theme.textColor.secondary,
                }}
                tableRowCellStyles={tableRowStyle}
                columnsDeps={[networkId, exchangeRates]}
                columns={columns as any}
                initialState={{
                    sorting: [
                        {
                            id: 'timestamp',
                            desc: true,
                        },
                    ],
                }}
                rowsPerPage={ticketsPerPage}
                isLoading={isLoading}
                data={ticketTransactions}
                noResultsMessage={t('market.table.no-results')}
                showPagination
                expandedRow={(row) => {
                    const ticketMarkets = getTicketMarkets(
                        row.original,
                        selectedOddsType,
                        language,
                        theme,
                        isMobile,
                        market
                    );

                    return (
                        <ExpandedRowWrapper>
                            <FirstExpandedSection>{ticketMarkets}</FirstExpandedSection>
                            <LastExpandedSection>
                                <QuoteWrapper>
                                    <QuoteLabel>{t('profile.table.total-quote')}:</QuoteLabel>
                                    <QuoteText>
                                        {formatTicketOdds(
                                            selectedOddsType,
                                            row.original.buyInAmount,
                                            row.original.payout
                                        )}
                                    </QuoteText>
                                </QuoteWrapper>
                                <TwitterWrapper>
                                    <TwitterIcon onClick={() => onTwitterIconClick(row.original)} />
                                </TwitterWrapper>
                            </LastExpandedSection>
                        </ExpandedRowWrapper>
                    );
                }}
                expandAll={expandAll}
            ></Table>
            {showShareTicketModal && shareTicketModalData && (
                <ShareTicketModalV2
                    markets={shareTicketModalData.markets}
                    multiSingle={false}
                    paid={shareTicketModalData.paid}
                    payout={shareTicketModalData.payout}
                    onClose={shareTicketModalData.onClose}
                    isTicketLost={shareTicketModalData.isTicketLost}
                    collateral={shareTicketModalData.collateral}
                    isLive={shareTicketModalData.isLive}
                    applyPayoutMultiplier={shareTicketModalData.applyPayoutMultiplier}
                />
            )}
        </>
    );
};

const getTicketMarketStatusIcon = (market: TicketMarket) => {
    return market.isCancelled ? (
        <MarketStatusIcon className={`icon icon--lost`} />
    ) : market.isOpen ? (
        market.maturityDate < new Date() ? (
            <MarketStatusIcon className={`icon icon--ongoing`} />
        ) : (
            <MarketStatusIcon className={`icon icon--ticket-open`} />
        )
    ) : market.isWinning ? (
        <MarketStatusIcon className={`icon icon--ticket-win`} />
    ) : (
        <MarketStatusIcon className={`icon icon--ticket-loss`} />
    );
};

const getOpacity = (market: TicketMarket) => (market.isResolved && !market.isWinning ? 0.5 : 1);

const getTicketMarkets = (
    ticket: Ticket,
    selectedOddsType: OddsType,
    language: string,
    theme: ThemeInterface,
    isMobile: boolean,
    market?: SportMarket
) => {
    return ticket.sportMarkets.map((ticketMarket, index) => {
        const isCurrentMarket = market && ticketMarket.gameId === market.gameId;
        return (
            <TicketRow highlighted={isCurrentMarket} style={{ opacity: getOpacity(ticketMarket) }} key={`m-${index}`}>
                <SPAAnchor href={buildMarketLink(ticketMarket.gameId, language)}>
                    <FlexDivColumn>
                        <TeamNamesContainer>
                            <TeamNameLabel>{getTeamNameV2(ticketMarket, 0)}</TeamNameLabel>
                            {!ticketMarket.isOneSideMarket && !ticketMarket.isPlayerPropsMarket && (
                                <>
                                    {!isMobile && <TeamNameLabel>&nbsp;-&nbsp;</TeamNameLabel>}
                                    <TeamNameLabel>{getTeamNameV2(ticketMarket, 1)}</TeamNameLabel>
                                </>
                            )}
                        </TeamNamesContainer>
                        {ticketMarket.isPlayerPropsMarket && !isCurrentMarket && (
                            <MatchTeamsLabel>{`(${getMatchTeams(ticketMarket)})`}</MatchTeamsLabel>
                        )}
                    </FlexDivColumn>
                </SPAAnchor>
                <SelectionInfoContainer>
                    <MarketTypeInfo>{getTitleText(ticketMarket)}</MarketTypeInfo>
                    <PositionInfo>
                        <PositionText>{getPositionTextV2(ticketMarket, ticketMarket.position, true)}</PositionText>
                        <Odd>{formatMarketOdds(selectedOddsType, getTicketMarketOdd(ticketMarket))}</Odd>
                    </PositionInfo>
                </SelectionInfoContainer>
                <MarketStatus
                    color={
                        ticketMarket.isOpen || ticketMarket.isCancelled
                            ? theme.status.open
                            : ticketMarket.isWinning
                            ? theme.status.win
                            : theme.status.loss
                    }
                >
                    {getTicketMarketStatusIcon(ticketMarket)}
                    {getTicketMarketStatus(ticketMarket)}
                </MarketStatus>
            </TicketRow>
        );
    });
};

export default TicketTransactionsTable;
