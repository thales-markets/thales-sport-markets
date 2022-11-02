import PositionSymbol from 'components/PositionSymbol';
import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { PositionName, POSITION_MAP } from 'constants/options';
import { useParlayMarketsQuery } from 'queries/markets/useParlayMarketsQuery';
import useUserTransactionsQuery from 'queries/markets/useUserTransactionsQuery';
import React from 'react';
import { useSelector } from 'react-redux';
import { getOddsType } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { formatTxTimestamp } from 'utils/formatters/date';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';
import {
    convertPositionNameToPositionType,
    convertPositionToSymbolType,
    formatMarketOdds,
    getIsApexTopGame,
} from 'utils/markets';
import { getPositionColor } from 'utils/ui';
// import { convertPositionNameToPosition, convertPositionToTeamName } from 'utils/markets';

const TransactionsHistory: React.FC = () => {
    const selectedOddsType = useSelector(getOddsType);
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const txQuery = useUserTransactionsQuery(walletAddress.toLowerCase(), networkId, {
        enabled: isWalletConnected,
        refetchInterval: false,
    });
    const transactions = txQuery.isSuccess ? txQuery.data : [];

    const parlaysTxQuery = useParlayMarketsQuery(walletAddress.toLowerCase(), networkId, undefined, undefined, {
        enabled: isWalletConnected,
        refetchInterval: false,
    });
    const parlayTx = parlaysTxQuery.isSuccess ? parlaysTxQuery.data : [];

    console.log('transactions: ', transactions);
    console.log('parlayTx: ', parlayTx);

    return (
        <>
            <Table
                tableHeadCellStyles={TableHeaderStyle}
                tableRowCellStyles={TableRowStyle}
                columns={[
                    {
                        id: 'time',
                        Header: <>{'TIME'}</>,
                        accessor: 'timestamp',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatTxTimestamp(cellProps.cell.value)}</TableText>;
                        },
                    },
                    {
                        id: 'id',
                        Header: <>{'Parlay ID'}</>,
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
                        Header: <>{'Number of Games'}</>,
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
                        Header: <>{'PAID'}</>,
                        accessor: 'sUSDAfterFees',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatCurrencyWithKey('sUSD', cellProps.cell.value, 2)}</TableText>;
                        },
                    },
                    {
                        id: 'amount',
                        Header: <>{'AMOUNT'}</>,
                        accessor: 'totalAmount',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>;
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
                isLoading={txQuery?.isLoading}
                data={parlayTx ?? []}
                expandedRow={(row) => {
                    console.log(row);

                    const toRender = row.original.positions.map((position: any, index: number) => {
                        const positionEnum = convertPositionNameToPositionType(position ? position.side : '');
                        return (
                            <FlexDivRowCentered key={index}>
                                <TableText>{position.market.homeTeam + ' vs ' + position.market.awayTeam}</TableText>
                                <PositionSymbol
                                    type={convertPositionToSymbolType(
                                        positionEnum,
                                        getIsApexTopGame(position.market.isApex, position.market.betType)
                                    )}
                                    symbolColor={getPositionColor(positionEnum)}
                                    additionalText={{
                                        firstText: formatMarketOdds(
                                            selectedOddsType,
                                            row.original.marketQuotes ? row.original.marketQuotes[index] : 0
                                        ),
                                        firstTextStyle: {
                                            fontSize: '12px',
                                            color: getPositionColor(positionEnum),
                                            marginLeft: '5px',
                                        },
                                    }}
                                />
                            </FlexDivRowCentered>
                        );
                    });
                    return <FlexDivColumnCentered>{toRender}</FlexDivColumnCentered>;
                }}
            ></Table>
            <Table
                tableHeadCellStyles={TableHeaderStyle}
                tableRowCellStyles={TableRowStyle}
                columns={[
                    {
                        id: 'time',
                        Header: <>{'TIME'}</>,
                        accessor: 'timestamp',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatTxTimestamp(cellProps.cell.value)}</TableText>;
                        },
                    },
                    {
                        id: 'id',
                        Header: <>{'ID'}</>,
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
                        Header: <>{'Position'}</>,
                        accessor: 'position',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            console.log(cellProps);
                            return (
                                <FlexCenter>
                                    <TableText>
                                        {
                                            /* {   {convertPositionToTeamName(
                                        convertPositionNameToPosition() as number,
                                        cellProps.cell.row.original.wholeMarket
                                    )}} */ cellProps
                                                .cell.value
                                        }
                                    </TableText>
                                    <CircleNumber>{POSITION_MAP[cellProps.cell.value as PositionName]}</CircleNumber>
                                </FlexCenter>
                            );
                        },
                    },
                    {
                        id: 'paid',
                        Header: <>{'PAID'}</>,
                        accessor: 'paid',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatCurrencyWithKey('sUSD', cellProps.cell.value, 2)}</TableText>;
                        },
                    },
                    {
                        id: 'amount',
                        Header: <>{'AMOUNT'}</>,
                        accessor: 'amount',
                        sortable: false,
                        Cell: (cellProps: any) => {
                            return <TableText>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</TableText>;
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
                isLoading={txQuery?.isLoading}
                data={transactions}
            ></Table>
        </>
    );
};

const TableText = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    text-align: center;
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

const CircleNumber = styled.span`
    display: flex;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    color: #5fc694;
    background: #1a1c2b;
    border: 2px solid #5fc694;
    border-radius: 50%;
    width: 23px;
    height: 23px;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
`;

export default TransactionsHistory;
