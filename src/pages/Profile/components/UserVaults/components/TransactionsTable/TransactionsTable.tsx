import Table from 'components/Table';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import useUserVaultAndLpTransactions from 'queries/wallet/useProfileLiquidityPoolUserTransactions';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CellProps } from 'react-table';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { formatCurrency, formatTxTimestamp } from 'thales-utils';
import { ProfileLiquidityPoolUserTransaction, ProfileLiquidityPoolUserTransactions } from 'types/liquidityPool';
import { ThemeInterface } from 'types/ui';

const TransactionsTable: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const txQuery = useUserVaultAndLpTransactions(networkId, walletAddress, {
        enabled: walletAddress !== '',
    });

    const [lastValidData, setLastValidData] = useState<ProfileLiquidityPoolUserTransactions>([]);

    useEffect(() => {
        if (txQuery.isSuccess && txQuery.data) setLastValidData(txQuery.data);
    }, [txQuery]);

    // @ts-ignore
    return (
        <Wrapper>
            <Title>{t('markets.nav-menu.items.history')}</Title>
            <Table
                tableHeadCellStyles={{
                    ...TableHeaderStyle,
                    color: theme.textColor.secondary,
                }}
                tableRowCellStyles={TableRowStyle}
                columns={[
                    {
                        Header: <>{t('profile.table.date-time-col')}</>,
                        accessor: 'timestamp',
                        Cell: (
                            cellProps: CellProps<
                                ProfileLiquidityPoolUserTransaction,
                                ProfileLiquidityPoolUserTransaction['timestamp']
                            >
                        ) => <TableText>{formatTxTimestamp(cellProps.cell.value)}</TableText>,
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t(`profile.table.name-col`)}</>,
                        accessor: 'name',
                        Cell: (
                            cellProps: CellProps<
                                ProfileLiquidityPoolUserTransaction,
                                ProfileLiquidityPoolUserTransaction['name']
                            >
                        ) => <TableText> {t(`profile.table.${cellProps.cell.value}`)}</TableText>,
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('profile.table.type-col')}</>,
                        accessor: 'type',
                        sortType: 'alphanumeric',
                        Cell: (
                            cellProps: CellProps<
                                ProfileLiquidityPoolUserTransaction,
                                ProfileLiquidityPoolUserTransaction['type']
                            >
                        ) => <TableText>{t(`profile.table.${cellProps.cell.value}`)}</TableText>,
                        width: 150,
                        sortable: true,
                    },
                    {
                        Header: <>{t('profile.table.amount-col')}</>,
                        sortType: 'basic',
                        accessor: 'amount',
                        Cell: (
                            cellProps: CellProps<
                                ProfileLiquidityPoolUserTransaction,
                                ProfileLiquidityPoolUserTransaction['amount']
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
                        Header: <>{t('profile.table.round-col')}</>,
                        accessor: 'round',
                        Cell: (
                            cellProps: CellProps<
                                ProfileLiquidityPoolUserTransaction,
                                ProfileLiquidityPoolUserTransaction['round']
                            >
                        ) => (
                            <TableText>
                                {t('profile.table.round-label')} {cellProps.cell.value}
                            </TableText>
                        ),
                        width: 150,
                    },
                    {
                        Header: <>{t('profile.table.tx-status-col')}</>,
                        accessor: 'hash',
                        Cell: (
                            cellProps: CellProps<
                                ProfileLiquidityPoolUserTransaction,
                                ProfileLiquidityPoolUserTransaction['hash']
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
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 10px;
`;

const TableHeaderStyle: React.CSSProperties = {
    textAlign: 'center',
    justifyContent: 'center',
};

const TableRowStyle: React.CSSProperties = {
    justifyContent: 'center',
    padding: '0',
};

const TableText = styled.span`
    font-weight: 600;
    font-size: 12px;
    text-align: center;
    @media (max-width: 767px) {
        font-size: 10px;
    }
    @media (max-width: 575px) {
        font-size: 9px;
    }
`;

export default TransactionsTable;
