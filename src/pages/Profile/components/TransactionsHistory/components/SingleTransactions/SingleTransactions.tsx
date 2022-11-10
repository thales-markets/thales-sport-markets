import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { PositionName, POSITION_MAP } from 'constants/options';
import useUserTransactionsQuery from 'queries/markets/useUserTransactionsQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { formatTxTimestamp } from 'utils/formatters/date';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'utils/formatters/number';

const TransactionsHistory: React.FC = () => {
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const { t } = useTranslation();

    const txQuery = useUserTransactionsQuery(walletAddress.toLowerCase(), networkId, {
        enabled: isWalletConnected,
        refetchInterval: false,
    });
    const transactions = txQuery.isSuccess ? txQuery.data : [];

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
    @media (max-width: 600px) {
        font-size: 10px;
        width: 18px;
        height: 18px;
    }
`;

export default TransactionsHistory;
