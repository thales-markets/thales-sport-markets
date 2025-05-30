import ShareTicketModalV2 from 'components/ShareTicketModalV2';
import Table from 'components/Table';
import Tooltip from 'components/Tooltip';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { USD_SIGN } from 'constants/currency';
import { ContractType } from 'enums/contract';
import { RiskManagementRole } from 'enums/riskManagement';
import { TicketAction } from 'enums/tickets';
import useWhitelistedAddressQuery from 'queries/markets/useWhitelistedAddressQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getOddsType } from 'redux/modules/ui';
import { useTheme } from 'styled-components';
import {
    Coins,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    formatDateWithTime,
    getEtherscanAddressLink,
    truncateAddress,
} from 'thales-utils';
import { Rates } from 'types/collateral';
import { SportMarket, Ticket } from 'types/markets';
import { ShareTicketModalProps } from 'types/tickets';
import { ThemeInterface } from 'types/ui';
import { getDefaultCollateral } from 'utils/collaterals';
import { getContractInstance } from 'utils/contract';
import { formatTicketOdds, getTicketMarketOdd, tableSortByStatus } from 'utils/tickets';
import { Client } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import MigrateTicketModal from '../MigrateTicketModal';
import TicketMarkets from '../TicketMarkets';
import {
    CancelIcon,
    ExpandedRowWrapper,
    ExternalLink,
    FirstExpandedSection,
    FreeBetIcon,
    LastExpandedSection,
    LiveSystemIndicatorContainer,
    LiveSystemLabel,
    MigrateIcon,
    QuoteLabel,
    QuoteText,
    QuoteWrapper,
    StatusIcon,
    StatusWrapper,
    TableText,
    TwitterIcon,
    TwitterWrapper,
    tableHeaderStyle,
    tableRowStyle,
} from './styled-components';

type TicketTransactionsTableProps = {
    ticketTransactions: Ticket[];
    market?: SportMarket;
    tableHeight?: string;
    tableStyle?: string;
    isLoading: boolean;
    ticketsPerPage?: number;
    expandAll?: boolean;
};

const TicketTransactionsTable: React.FC<TicketTransactionsTableProps> = ({
    ticketTransactions,
    market,
    tableHeight,
    tableStyle,
    isLoading,
    ticketsPerPage,
    expandAll,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const selectedOddsType = useSelector(getOddsType);

    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();
    const { address, isConnected } = useAccount();
    const walletAddress = address || '';

    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps | undefined>(undefined);
    const [ticketForMigration, setTicketForMigration] = useState<Ticket | undefined>(undefined);

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

    const whitelistedAddressQuery = useWhitelistedAddressQuery(
        walletAddress,
        RiskManagementRole.MARKET_RESOLVING,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );
    const isWitelistedForResolve = useMemo(() => whitelistedAddressQuery.isSuccess && whitelistedAddressQuery.data, [
        whitelistedAddressQuery.data,
        whitelistedAddressQuery.isSuccess,
    ]);

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
            isSgp: ticket.isSgp,
            applyPayoutMultiplier: false,
            isTicketOpen: ticket.isOpen,
            systemBetData: ticket.systemBetData,
        };
        setShareTicketModalData(modalData);
        setShowShareTicketModal(true);
    };

    const handleTicketCancel = async (ticketAddress: string) => {
        const sportAmmContract = getContractInstance(ContractType.SPORTS_AMM_V2, {
            client: walletClient?.data,
            networkId,
        });

        if (sportAmmContract) {
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                const txHash = await sportAmmContract?.write?.handleTicketResolving([
                    ticketAddress,
                    TicketAction.CANCEL,
                ]);

                const txReceipt = await waitForTransactionReceipt(client as Client, {
                    hash: txHash,
                });
                if (txReceipt.status === 'success') {
                    toast.update(
                        toastId,
                        getSuccessToastOptions(t('markets.resolve-modal.cancel-confirmation-message'))
                    );
                }
            } catch (e) {
                toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
            }
        }
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
                        <LiveSystemIndicatorContainer
                            isLive={cellProps.row.original.isLive}
                            isSgp={cellProps.row.original.isSgp}
                            isSystem={cellProps.row.original.isSystemBet}
                        >
                            {cellProps.row.original.isLive ? (
                                <LiveSystemLabel>{t('profile.card.live')}</LiveSystemLabel>
                            ) : cellProps.row.original.isSgp ? (
                                <LiveSystemLabel>{t('profile.card.sgp')}</LiveSystemLabel>
                            ) : cellProps.row.original.isSystemBet ? (
                                <LiveSystemLabel>{t('profile.card.system-short')}</LiveSystemLabel>
                            ) : (
                                <></>
                            )}
                        </LiveSystemIndicatorContainer>
                        <TableText>{formatDateWithTime(cellProps.cell.getValue())}</TableText>
                    </>
                );
            },
        },
        {
            header: <>{t('profile.table.owner')}</>,
            accessorKey: 'account',
            enableSorting: false,
            cell: (cellProps: any) => {
                return (
                    <ExternalLink
                        href={getEtherscanAddressLink(networkId, cellProps.row.original.id)}
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
                return (
                    <TableText>{`${
                        cellProps.row.original.isSystemBet
                            ? `${cellProps.row.original.systemBetData?.systemBetDenominator}/`
                            : ''
                    }${cellProps.cell.getValue()}`}</TableText>
                );
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
            sortingFn: (rowA: any, rowB: any) => {
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
            sortingFn: (rowA: any, rowB: any) => {
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
                    statusComponent = (
                        <>
                            <Tooltip overlay={t('profile.free-bet.claim-btn')}>
                                <FreeBetIcon className={'icon icon--gift'} />
                            </Tooltip>
                            {statusComponent}
                        </>
                    );
                }

                if (isWitelistedForResolve && cellProps.row.original.isOpen) {
                    statusComponent = (
                        <>
                            {statusComponent}
                            <Tooltip overlay={t('markets.resolve-modal.cancel-ticket-tooltip')}>
                                <CancelIcon
                                    className={`icon icon--wrong-full`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleTicketCancel(cellProps.row.original.id);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip overlay={t('markets.resolve-modal.migrate-ticket-tooltip')}>
                                <MigrateIcon
                                    className={`icon icon--exchange`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setTicketForMigration(cellProps.row.original);
                                    }}
                                />
                            </Tooltip>
                        </>
                    );
                }
                return statusComponent;
            },
            sortingFn: tableSortByStatus,
        },
    ];

    return (
        <>
            <Table
                tableHeight={tableHeight}
                tableStyle={tableStyle}
                tableHeadCellStyles={{
                    ...tableHeaderStyle,
                    color: theme.textColor.secondary,
                }}
                tableRowCellStyles={tableRowStyle}
                columnsDeps={[networkId, exchangeRates, isWitelistedForResolve, walletClient]}
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
                    return (
                        <ExpandedRowWrapper>
                            <FirstExpandedSection>
                                <TicketMarkets
                                    ticket={row.original}
                                    market={market}
                                    isWitelistedForResolve={isWitelistedForResolve}
                                />
                            </FirstExpandedSection>
                            {row.original.isSystemBet ? (
                                <>
                                    <LastExpandedSection>
                                        <QuoteWrapper>
                                            <QuoteLabel>{t('profile.card.system')}:</QuoteLabel>
                                            <QuoteText>
                                                {row.original.systemBetData?.systemBetDenominator}/
                                                {row.original.numOfMarkets}
                                            </QuoteText>
                                        </QuoteWrapper>
                                        <QuoteWrapper>
                                            <QuoteLabel>{t('profile.card.number-of-combination')}:</QuoteLabel>
                                            <QuoteText>{row.original.systemBetData?.numberOfCombination}</QuoteText>
                                        </QuoteWrapper>
                                    </LastExpandedSection>
                                    <LastExpandedSection>
                                        {!row.original.isUserTheWinner && (
                                            <QuoteWrapper>
                                                <QuoteLabel>{t('profile.card.max-quote')}:</QuoteLabel>
                                                <QuoteText>
                                                    {formatTicketOdds(
                                                        selectedOddsType,
                                                        row.original.systemBetData?.buyInPerCombination,
                                                        row.original.systemBetData?.maxPayout
                                                    )}
                                                </QuoteText>
                                            </QuoteWrapper>
                                        )}
                                        <QuoteWrapper>
                                            <QuoteLabel>{t('profile.card.paid-per-combination')}:</QuoteLabel>
                                            <QuoteText>
                                                {formatCurrencyWithKey(
                                                    row.original.collateral,
                                                    row.original.systemBetData?.buyInPerCombination || 0
                                                )}
                                            </QuoteText>
                                        </QuoteWrapper>
                                        {row.original.isUserTheWinner && (
                                            <QuoteWrapper>
                                                <QuoteLabel>
                                                    {t('profile.card.number-of-winning-combination')}:
                                                </QuoteLabel>
                                                <QuoteText>
                                                    {row.original.systemBetData?.numberOfWinningCombinations}
                                                </QuoteText>
                                            </QuoteWrapper>
                                        )}
                                    </LastExpandedSection>
                                    <LastExpandedSection>
                                        {row.original.isUserTheWinner && (
                                            <QuoteWrapper>
                                                <QuoteLabel>{t('profile.card.winning-quote')}:</QuoteLabel>
                                                <QuoteText>
                                                    {formatTicketOdds(
                                                        selectedOddsType,
                                                        row.original.systemBetData?.buyInPerCombination,
                                                        row.original.payout
                                                    )}
                                                </QuoteText>
                                            </QuoteWrapper>
                                        )}
                                        {!row.original.isUserTheWinner && (
                                            <QuoteWrapper>
                                                <QuoteLabel>{t('profile.card.min-payout')}:</QuoteLabel>
                                                <QuoteText>
                                                    {formatCurrencyWithKey(
                                                        row.original.collateral,
                                                        row.original.systemBetData?.minPayout || 0
                                                    )}
                                                </QuoteText>
                                            </QuoteWrapper>
                                        )}
                                        <QuoteWrapper>
                                            <QuoteLabel>
                                                {row.original.isUserTheWinner
                                                    ? t('profile.card.payout')
                                                    : t('profile.card.max-payout')}
                                                :
                                            </QuoteLabel>
                                            <QuoteText>
                                                {formatCurrencyWithKey(
                                                    row.original.collateral,
                                                    row.original.isUserTheWinner
                                                        ? row.original.payout
                                                        : row.original.systemBetData?.maxPayout || 0
                                                )}
                                            </QuoteText>
                                        </QuoteWrapper>
                                        <TwitterWrapper>
                                            <TwitterIcon onClick={() => onTwitterIconClick(row.original)} />
                                        </TwitterWrapper>
                                    </LastExpandedSection>
                                </>
                            ) : (
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
                            )}
                        </ExpandedRowWrapper>
                    );
                }}
                expandAll={expandAll}
            ></Table>
            {ticketForMigration && isWitelistedForResolve && (
                <MigrateTicketModal ticket={ticketForMigration} onClose={() => setTicketForMigration(undefined)} />
            )}
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
                    isSgp={shareTicketModalData.isSgp}
                    applyPayoutMultiplier={shareTicketModalData.applyPayoutMultiplier}
                    systemBetData={shareTicketModalData.systemBetData}
                    isTicketOpen={shareTicketModalData.isTicketOpen}
                />
            )}
        </>
    );
};

export default TicketTransactionsTable;
