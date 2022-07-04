import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { formatTxTimestamp } from 'utils/formatters/date';
import Table from 'components/Table';
import { UserTransaction, UserTransactions } from 'types/markets';
import { formatCurrency } from '../../../../utils/formatters/number';
import styled from 'styled-components';
import { ODDS_COLOR } from '../../../../constants/ui';
import { POSITION_MAP } from 'constants/options';

type HistoryPropsTable = {
    transactions: UserTransactions;
    noResultsMessage?: React.ReactNode;
    isLoading: boolean;
};

export const HistoryTable: FC<HistoryPropsTable> = memo(({ transactions, noResultsMessage, isLoading }) => {
    const { t } = useTranslation();
    // @ts-ignore
    return (
        <>
            <Table
                columns={[
                    {
                        Header: <>{t('market.table.date-time-col')}</>,
                        accessor: 'timestamp',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['timestamp']>) => (
                            <p>{formatTxTimestamp(cellProps.cell.value)}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>Game</>,
                        accessor: 'game',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['game']>) => (
                            <p>{cellProps.cell.value}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.type-col')}</>,
                        accessor: 'type',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['type']>) => (
                            <p>{t(`market.table.type.${cellProps.cell.value}`)}</p>
                        ),
                        width: 50,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.position-col')}</>,
                        accessor: 'positionTeam',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['positionTeam']>) => (
                            <p>{cellProps.cell.value}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.amount-col')}</>,
                        sortType: 'basic',
                        accessor: 'amount',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['amount']>) => (
                            <>
                                <PositionCircle color={ODDS_COLOR[cellProps.row.original.position]}>
                                    {POSITION_MAP[cellProps.row.original.position]}
                                </PositionCircle>
                                <p>{cellProps.cell.value}</p>
                            </>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>Usd Value</>,
                        accessor: 'usdValue',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['usdValue']>) => (
                            <p>${formatCurrency(cellProps.cell.value)}</p>
                        ),
                        width: 150,
                    },
                    {
                        Header: <>Result</>,
                        accessor: 'result',
                        Cell: (cellProps: CellProps<UserTransaction, UserTransaction['result']>) => (
                            <>
                                <PositionCircle color="#3FD1FF">{POSITION_MAP[cellProps.cell.value]}</PositionCircle>
                            </>
                        ),
                        width: 150,
                    },
                ]}
                data={transactions}
                isLoading={isLoading}
                noResultsMessage={noResultsMessage}
                onTableRowClick={(e) => {
                    window.open(e.original.link, '_blank');
                }}
            />
        </>
    );
});

const PositionCircle = styled.span<{ color: string }>`
    width: 20px;
    height: 20px;
    border-radius: 100%;
    display: inline-block;
    text-align: center;
    font-weight: bold;
    margin-right: 10px;
    line-height: 21px;
    padding-left: 1px;
    background-color: ${(props) => props.color};
    color: #1a1c2b;
`;

export default HistoryTable;
