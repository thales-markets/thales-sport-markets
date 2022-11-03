import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { formatTxTimestamp } from 'utils/formatters/date';
import Table from 'components/Table';
import styled from 'styled-components';
import { ODDS_COLOR } from 'constants/ui';
import { Position, POSITION_MAP, PositionName } from 'constants/options';
import { buildMarketLink } from 'utils/routes';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import './style.css';
import i18n from 'i18n';
import { formatCurrency } from 'utils/formatters/number';
import SPAAnchor from 'components/SPAAnchor';
import { VaultTrade, VaultTrades } from 'types/vault';
import { VaultTradeStatus } from 'constants/vault';
import { Colors } from 'styles/common';

type TradesTableProps = {
    transactions: VaultTrades;
    noResultsMessage?: React.ReactNode;
    isLoading: boolean;
};

export const TradesTable: FC<TradesTableProps> = memo(({ transactions, noResultsMessage, isLoading }) => {
    const { t } = useTranslation();
    const language = i18n.language;
    // @ts-ignore
    return (
        <>
            <Table
                columns={[
                    {
                        Header: <>{t('market.table.date-time-col')}</>,
                        accessor: 'timestamp',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['timestamp']>) => (
                            <p>{formatTxTimestamp(cellProps.cell.value)}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.game-col')}</>,
                        accessor: 'game',
                        sortType: 'alphanumeric',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['game']>) => (
                            <SPAAnchor
                                className="hover-underline"
                                onClick={(e) => e.stopPropagation()}
                                href={buildMarketLink(cellProps.row.original.market, language)}
                            >
                                {cellProps.cell.value}
                            </SPAAnchor>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.position-col')}</>,
                        accessor: 'positionTeam',
                        sortType: 'alphanumeric',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['positionTeam']>) => (
                            <p>{cellProps.cell.value}</p>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.amount-col')}</>,
                        sortType: 'basic',
                        accessor: 'amount',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['amount']>) => (
                            <>
                                <PositionCircle color={ODDS_COLOR[cellProps.row.original.position]}>
                                    {POSITION_MAP[cellProps.row.original.position]}
                                </PositionCircle>
                                <p>{formatCurrency(cellProps.cell.value)}</p>
                            </>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.usd-value-col')}</>,
                        accessor: 'paid',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['paid']>) => (
                            <p>${formatCurrency(cellProps.cell.value)}</p>
                        ),
                        width: 150,
                        sortable: true,
                        sortType: 'basic',
                    },
                    {
                        Header: <>{t('market.table.result-col')}</>,
                        accessor: 'result',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['result']>) => (
                            <>
                                {cellProps.cell.value && (
                                    <PositionCircle color="#3FD1FF">
                                        {POSITION_MAP[cellProps.cell.value]}
                                    </PositionCircle>
                                )}
                                {cellProps.row.original.status !== VaultTradeStatus.IN_PROGRESS && (
                                    <Status
                                        color={
                                            cellProps.row.original.status == VaultTradeStatus.WIN
                                                ? Colors.GREEN
                                                : Colors.RED
                                        }
                                    >
                                        {cellProps.row.original.status}
                                    </Status>
                                )}
                            </>
                        ),
                        width: 150,
                        sortable: true,
                        sortType: (rowA: any, rowB: any, _columnId?: string, desc?: boolean) => {
                            let aValue = (Position[rowA.original.result as PositionName] ?? -1) + 1;
                            let bValue = (Position[rowB.original.result as PositionName] ?? -1) + 1;
                            if (!aValue) {
                                aValue = desc ? -1 : 3;
                            }
                            if (!bValue) {
                                bValue = desc ? -1 : 3;
                            }
                            return aValue < bValue ? -1 : 1;
                        },
                    },
                    {
                        Header: <>{t('market.table.tx-status-col')}</>,
                        accessor: 'hash',
                        Cell: (cellProps: CellProps<VaultTrade, VaultTrade['hash']>) => (
                            <ViewEtherscanLink hash={cellProps.cell.value} />
                        ),
                        width: 150,
                    },
                ]}
                data={transactions}
                isLoading={isLoading}
                noResultsMessage={noResultsMessage}
                tableRowStyles={{ minHeight: '50px' }}
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

const Status = styled.span<{ color: string }>`
    color: ${(props) => props.color};
`;

export default TradesTable;
