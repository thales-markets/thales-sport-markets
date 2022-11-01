import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { PositionName, POSITION_MAP } from 'constants/options';
import { useParlayMarketsQuery } from 'queries/markets/useParlayMarketsQuery';
import useUserTransactionsQuery from 'queries/markets/useUserTransactionsQuery';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { formatTxTimestamp } from 'utils/formatters/date';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'utils/formatters/number';
// import { convertPositionNameToPosition, convertPositionToTeamName } from 'utils/markets';

const TransactionsHistory: React.FC = () => {
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
    );
};

const TableText = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    line-height: 263%;
    text-align: center;
    white-space: nowrap;
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
