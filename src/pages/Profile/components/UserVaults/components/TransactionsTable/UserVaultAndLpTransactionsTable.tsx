import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { formatTxTimestamp } from 'utils/formatters/date';
import Table from 'components/Table';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import { formatCurrency } from 'utils/formatters/number';
import useUserVaultAndLpTransactions from 'queries/wallet/useUserVaultAndLpTransactions';
import { useSelector } from 'react-redux';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { VaultsAndLiquidityPoolUserTransaction, VaultsAndLiquidityPoolUserTransactions } from 'types/liquidityPool';
import styled from 'styled-components';

export const UserVaultAndLpTransactionsTable: React.FC = () => {
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const txQuery = useUserVaultAndLpTransactions(networkId, walletAddress, {
        enabled: walletAddress !== '',
    });

    const [lastValidData, setLastValidData] = useState<VaultsAndLiquidityPoolUserTransactions>([]);

    useEffect(() => {
        if (txQuery.isSuccess && txQuery.data) setLastValidData(txQuery.data);
    }, [txQuery]);

    // @ts-ignore
    return (
        <Wrapper>
            <Title>{t('markets.nav-menu.items.history')}</Title>
            <Table
                tableHeadCellStyles={TableHeaderStyle}
                tableRowCellStyles={TableRowStyle}
                columns={[
                    {
                        Header: <>{t('market.table.date-time-col')}</>,
                        accessor: 'timestamp',
                        Cell: (
                            cellProps: CellProps<
                                VaultsAndLiquidityPoolUserTransaction,
                                VaultsAndLiquidityPoolUserTransaction['timestamp']
                            >
                        ) => <TableText>{formatTxTimestamp(cellProps.cell.value)}</TableText>,
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t(`vault.user-transactions.name`)}</>,
                        accessor: 'name',
                        Cell: (
                            cellProps: CellProps<
                                VaultsAndLiquidityPoolUserTransaction,
                                VaultsAndLiquidityPoolUserTransaction['name']
                            >
                        ) => <TableText> {t(`vault.${cellProps.cell.value}.title`)}</TableText>,
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.type-col')}</>,
                        accessor: 'type',
                        sortType: 'alphanumeric',
                        Cell: (
                            cellProps: CellProps<
                                VaultsAndLiquidityPoolUserTransaction,
                                VaultsAndLiquidityPoolUserTransaction['type']
                            >
                        ) => <TableText>{t(`vault.user-transactions.type.${cellProps.cell.value}`)}</TableText>,
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('market.table.amount-col')}</>,
                        sortType: 'basic',
                        accessor: 'amount',
                        Cell: (
                            cellProps: CellProps<
                                VaultsAndLiquidityPoolUserTransaction,
                                VaultsAndLiquidityPoolUserTransaction['amount']
                            >
                        ) => (
                            <>
                                <TableText>
                                    {cellProps.cell.row.original.type === 'withdrawalRequest'
                                        ? '-'
                                        : `$${formatCurrency(cellProps.cell.value)}`}
                                </TableText>
                            </>
                        ),
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('vault.trades-history.round-label')}</>,
                        accessor: 'round',
                        Cell: (
                            cellProps: CellProps<
                                VaultsAndLiquidityPoolUserTransaction,
                                VaultsAndLiquidityPoolUserTransaction['round']
                            >
                        ) => (
                            <TableText>
                                {t('vault.trades-history.round-label')} {cellProps.cell.value}
                            </TableText>
                        ),
                        width: 150,
                    },
                    {
                        Header: <>{t('market.table.tx-status-col')}</>,
                        accessor: 'hash',
                        Cell: (
                            cellProps: CellProps<
                                VaultsAndLiquidityPoolUserTransaction,
                                VaultsAndLiquidityPoolUserTransaction['hash']
                            >
                        ) => <ViewEtherscanLink hash={cellProps.cell.value} />,
                        width: 150,
                    },
                ]}
                data={lastValidData}
                isLoading={lastValidData.length === 0 && txQuery.isFetching}
                noResultsMessage={t('profile.messages.no-transactions')}
                tableRowStyles={{ minHeight: '50px' }}
            />
        </Wrapper>
    );
};

const Wrapper = styled.div`
    margin: 30px 0;
`;

const Title = styled.p`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    color: #ffffff;
`;

const TableHeaderStyle: React.CSSProperties = {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '12px',
    lineHeight: '14px',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#5F6180',
    justifyContent: 'center',
};

const TableRowStyle: React.CSSProperties = {
    justifyContent: 'center',
    padding: '0',
};

const TableText = styled.span`
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    text-align: center;
    @media (max-width: 600px) {
        font-size: 10px;
    }
`;

export default UserVaultAndLpTransactionsTable;
