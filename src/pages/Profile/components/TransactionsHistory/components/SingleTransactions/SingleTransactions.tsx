import PositionSymbol from 'components/PositionSymbol';
import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { ethers } from 'ethers';
import useUserTransactionsQuery from 'queries/markets/useUserTransactionsQuery';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { getEtherscanTxLink } from 'utils/etherscan';
import { formatTxTimestamp } from 'utils/formatters/date';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'utils/formatters/number';
import {
    convertFinalResultToResultType,
    convertPositionNameToPosition,
    convertPositionNameToPositionType,
    getOddTooltipText,
    getSpreadTotalText,
    getSymbolText,
} from 'utils/markets';
import { TwitterIcon } from 'pages/Markets/Home/Parlay/components/styled-components';
import ShareTicketModal, {
    ShareTicketModalProps,
} from 'pages/Markets/Home/Parlay/components/ShareTicketModal/ShareTicketModal';
import { ParlaysMarket } from 'types/markets';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { CollateralByNetworkId } from 'constants/network';
import { ThemeInterface } from 'types/ui';
import { useTheme } from 'styled-components';

const TransactionsHistory: React.FC<{ searchText?: string }> = ({ searchText }) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const [showShareTicketModal, setShowShareTicketModal] = useState(false);
    const [shareTicketModalData, setShareTicketModalData] = useState<ShareTicketModalProps>({
        markets: [],
        multiSingle: false,
        totalQuote: 0,
        paid: 0,
        payout: 0,
        onClose: () => {},
    });

    const isSearchTextWalletAddress = searchText && ethers.utils.isAddress(searchText);

    const txQuery = useUserTransactionsQuery(
        isSearchTextWalletAddress ? searchText : walletAddress.toLowerCase(),
        networkId,
        {
            enabled: isWalletConnected,
        }
    );
    const transactions = txQuery.isSuccess ? txQuery.data : [];

    const onTwitterIconClick = (data: any) => {
        // use average as currently we don't have historical odds for single game
        const calculatedAverageOdds = data.wholeMarket.isCanceled ? 1 : data.paid / data.amount;

        const winning =
            data.wholeMarket.isCanceled ||
            (data.wholeMarket.isResolved
                ? convertPositionNameToPositionType(data.position) ===
                  convertFinalResultToResultType(data.wholeMarket.finalResult)
                : undefined);

        const singleMarket: ParlaysMarket = {
            ...data.wholeMarket,
            homeOdds: calculatedAverageOdds,
            awayOdds: calculatedAverageOdds,
            drawOdds: calculatedAverageOdds,
            position: convertPositionNameToPositionType(data.position),
            winning,
        };

        const modalData: ShareTicketModalProps = {
            markets: [singleMarket],
            multiSingle: false,
            totalQuote: calculatedAverageOdds,
            paid: data.paid,
            payout: data.wholeMarket.isCanceled ? data.paid : data.amount,
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
                onTableCellClick={(row: any, cell: any) => {
                    cell.column.id !== 'share' ? open(getEtherscanTxLink(networkId, row.original.hash)) : undefined;
                }}
                columns={[
                    {
                        id: 'time',
                        Header: <>{t('profile.table.time')}</>,
                        accessor: 'timestamp',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                <TableColumnClickable>
                                    <TableText>{formatTxTimestamp(cellProps.cell.value)}</TableText>
                                </TableColumnClickable>
                            );
                        },
                    },
                    {
                        id: 'id',
                        Header: <>{t('profile.table.id')}</>,
                        accessor: 'wholeMarket',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                <TableColumnClickable>
                                    <TableText>
                                        {cellProps.cell.value.isOneSideMarket
                                            ? fixOneSideMarketCompetitorName(cellProps.cell.value.homeTeam)
                                            : `${cellProps.cell.value.homeTeam} vs ${cellProps.cell.value.awayTeam}`}
                                    </TableText>
                                </TableColumnClickable>
                            );
                        },
                    },
                    {
                        id: 'position',
                        Header: <>{t('profile.table.position')}</>,
                        accessor: 'position',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            const symbolText = getSymbolText(
                                convertPositionNameToPositionType(cellProps.cell.value),
                                cellProps.cell.row.original.wholeMarket
                            );

                            const spreadTotalText = getSpreadTotalText(
                                cellProps.cell.row.original.wholeMarket,
                                convertPositionNameToPositionType(cellProps.cell.value)
                            );

                            return (
                                <TableColumnClickable>
                                    <PositionSymbol
                                        symbolText={symbolText}
                                        additionalStyle={{ width: 25, height: 25, fontSize: 11, borderWidth: 2 }}
                                        justifyContent="center"
                                        symbolUpperText={
                                            spreadTotalText
                                                ? {
                                                      text: spreadTotalText,
                                                      textStyle: {
                                                          backgroundColor: '#1A1C2B',
                                                          fontSize: '10px',
                                                          top: '-7px',
                                                          left: '13px',
                                                          lineHeight: '100%',
                                                      },
                                                  }
                                                : undefined
                                        }
                                        tooltip={
                                            <>
                                                {getOddTooltipText(
                                                    convertPositionNameToPositionType(cellProps.cell.value),
                                                    cellProps.cell.row.original.wholeMarket
                                                )}
                                            </>
                                        }
                                    />
                                </TableColumnClickable>
                            );
                        },
                    },
                    {
                        id: 'paid',
                        Header: <>{t('profile.table.paid')}</>,
                        accessor: 'paid',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                <TableColumnClickable>
                                    <TableText>
                                        {formatCurrencyWithKey(
                                            CollateralByNetworkId[networkId],
                                            cellProps.cell.value,
                                            2
                                        )}
                                    </TableText>
                                </TableColumnClickable>
                            );
                        },
                    },
                    {
                        id: 'amount',
                        Header: <>{t('profile.table.amount')}</>,
                        accessor: 'amount',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                <TableColumnClickable>
                                    <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>
                                </TableColumnClickable>
                            );
                        },
                    },
                    {
                        id: 'status',
                        Header: <>{t('profile.table.status')}</>,
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                <TableColumnClickable>
                                    {getPositionStatus(cellProps.row.original, theme)}
                                </TableColumnClickable>
                            );
                        },
                    },
                    {
                        id: 'share',
                        Header: <></>,
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                cellProps.row.original.type === 'buy' && (
                                    <TwitterIcon
                                        fontSize={'15px'}
                                        onClick={() => onTwitterIconClick(cellProps.row.original)}
                                    />
                                )
                            );
                        },
                        width: '25px',
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
                isLoading={txQuery?.isLoading}
                data={transactions}
                noResultsMessage={t('profile.messages.no-transactions')}
            />
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

const getPositionStatus = (tx: any, theme: ThemeInterface) => {
    if (tx.type !== 'buy') {
        return <StatusWrapper color={theme.status.sold}>SOLD</StatusWrapper>;
    }
    if (tx.wholeMarket.isCanceled) {
        return <StatusWrapper color={theme.status.sold}>CANCELED</StatusWrapper>;
    }
    if (tx.wholeMarket.isResolved) {
        if (convertPositionNameToPosition(tx.position) === convertFinalResultToResultType(tx.wholeMarket.finalResult)) {
            return <StatusWrapper color={theme.status.win}>WON</StatusWrapper>;
        } else {
            return <StatusWrapper color={theme.status.loss}>LOSS</StatusWrapper>;
        }
    } else {
        return <StatusWrapper color={theme.status.open}>OPEN</StatusWrapper>;
    }
};

const TableText = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    text-align: center;
    @media (max-width: 600px) {
        font-size: 10px;
    }
`;

const StatusWrapper = styled.div`
    width: auto;
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
    padding-left: 5px;
    padding-right: 5px;
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
    paddingLeft: 0,
};

const TableRowStyle: React.CSSProperties = {
    justifyContent: 'center',
    padding: '0',
};

const TableColumnClickable = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    cursor: pointer;
`;

export default TransactionsHistory;
