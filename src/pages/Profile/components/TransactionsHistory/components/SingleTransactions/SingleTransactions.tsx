import PositionSymbol from 'components/PositionSymbol';
import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { ethers } from 'ethers';
import useUserTransactionsQuery from 'queries/markets/useUserTransactionsQuery';
import React from 'react';
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

const TransactionsHistory: React.FC<{ searchText?: string }> = ({ searchText }) => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const { t } = useTranslation();

    const isSearchTextWalletAddress = searchText && ethers.utils.isAddress(searchText);

    const txQuery = useUserTransactionsQuery(
        isSearchTextWalletAddress ? searchText : walletAddress.toLowerCase(),
        networkId,
        {
            enabled: isWalletConnected,
            refetchInterval: false,
        }
    );
    const transactions = txQuery.isSuccess ? txQuery.data : [];

    return (
        <>
            <Table
                tableHeadCellStyles={TableHeaderStyle}
                tableRowCellStyles={TableRowStyle}
                onTableRowClick={(data: any) => {
                    open(getEtherscanTxLink(networkId, data.original.hash));
                }}
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
                        accessor: 'wholeMarket',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return (
                                <TableText>
                                    {cellProps.cell.value.homeTeam} vs {cellProps.cell.value.awayTeam}
                                </TableText>
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
                                <FlexCenter>
                                    <PositionSymbol
                                        symbolText={symbolText}
                                        additionalStyle={{ width: 25, height: 25, fontSize: 11, borderWidth: 2 }}
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
                                </FlexCenter>
                            );
                        },
                    },
                    {
                        id: 'paid',
                        Header: <>{t('profile.table.paid')}</>,
                        accessor: 'paid',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatCurrencyWithKey('sUSD', cellProps.cell.value, 2)}</TableText>;
                        },
                    },
                    {
                        id: 'amount',
                        Header: <>{t('profile.table.amount')}</>,
                        accessor: 'amount',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>;
                        },
                    },
                    {
                        id: 'status',
                        Header: <>{t('profile.table.status')}</>,
                        sortable: false,
                        Cell: (cellProps: any) => getPositionStatus(cellProps.row.original),
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
            ></Table>
        </>
    );
};

const getPositionStatus = (tx: any) => {
    if (tx.type !== 'buy') {
        return <StatusWrapper color="#808080">SOLD</StatusWrapper>;
    }
    if (tx.wholeMarket.isCanceled) {
        return <StatusWrapper color="#808080">CANCELED</StatusWrapper>;
    }
    if (tx.wholeMarket.isResolved) {
        if (convertPositionNameToPosition(tx.position) === convertFinalResultToResultType(tx.wholeMarket.finalResult)) {
            return <StatusWrapper color="#5FC694">WON </StatusWrapper>;
        } else {
            return <StatusWrapper color="#E26A78">LOSS</StatusWrapper>;
        }
    } else {
        return <StatusWrapper color="#FFFFFF">OPEN</StatusWrapper>;
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

export default TransactionsHistory;
