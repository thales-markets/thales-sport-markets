import Table from 'components/Table';
import ViewEtherscanLink from 'components/ViewEtherscanLink';
import useProfileLiquidityPoolUserTransactions from 'queries/wallet/useProfileLiquidityPoolUserTransactions';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { formatCurrencyWithKey, formatTxTimestamp } from 'thales-utils';
import { LiquidityPoolUserTransactions } from 'types/liquidityPool';
import { RootState } from 'types/redux';
import { ThemeInterface } from 'types/ui';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';

const TransactionsTable: React.FC = () => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const txQuery = useProfileLiquidityPoolUserTransactions(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );

    const [lastValidData, setLastValidData] = useState<LiquidityPoolUserTransactions>([]);

    useEffect(() => {
        if (txQuery.isSuccess && txQuery.data) setLastValidData(txQuery.data);
    }, [txQuery]);

    return (
        <Wrapper>
            <Title>{t('markets.nav-menu.items.history')}</Title>
            <Table
                tableHeadCellStyles={{
                    ...TableHeaderStyle,
                    color: theme.textColor.secondary,
                }}
                tableRowCellStyles={TableRowStyle}
                columns={
                    [
                        {
                            header: <>{t('profile.table.date-time-col')}</>,
                            accessorKey: 'timestamp',
                            cell: (cellProps: any) => (
                                <TableText>{formatTxTimestamp(cellProps.cell.getValue())}</TableText>
                            ),
                            width: 150,
                            enableSorting: true,
                        },
                        {
                            header: <>{t(`profile.table.name-col`)}</>,
                            accessorKey: 'name',
                            cell: (cellProps: any) => <TableText> {cellProps.cell.getValue()}</TableText>,
                            width: 150,
                            enableSorting: true,
                        },
                        {
                            header: <>{t('profile.table.type-col')}</>,
                            accessorKey: 'type',
                            sortType: 'alphanumeric',
                            cell: (cellProps: any) => (
                                <TableText>{t(`profile.table.${cellProps.cell.getValue()}`)}</TableText>
                            ),
                            width: 150,
                            enableSorting: true,
                        },
                        {
                            header: <>{t('profile.table.amount-col')}</>,
                            sortType: 'basic',
                            accessorKey: 'amount',
                            cell: (cellProps: any) => (
                                <>
                                    <TableText>
                                        {cellProps.cell.row.original.type === 'withdrawalRequest'
                                            ? '-'
                                            : formatCurrencyWithKey(
                                                  cellProps.cell.row.original.collateral,
                                                  cellProps.cell.getValue()
                                              )}
                                    </TableText>
                                </>
                            ),
                            width: 150,
                            enableSorting: true,
                        },
                        {
                            header: <>{t('profile.table.round-col')}</>,
                            accessorKey: 'round',
                            cell: (cellProps: any) => (
                                <TableText>
                                    {t('profile.table.round-label')} {cellProps.cell.getValue()}
                                </TableText>
                            ),
                            width: 150,
                        },
                        {
                            header: <>{t('profile.table.tx-status-col')}</>,
                            accessorKey: 'hash',
                            cell: (cellProps: any) => <ViewEtherscanLink hash={cellProps.cell.getValue()} />,
                            width: 150,
                        },
                    ] as any
                }
                data={lastValidData}
                isLoading={lastValidData.length === 0 && txQuery.isFetching}
                noResultsMessage={t('profile.messages.no-lp-transactions')}
                tableRowStyles={{ minHeight: '50px' }}
            />
        </Wrapper>
    );
};

const Wrapper = styled.div`
    margin: 30px 0;
`;

const Title = styled.p`
    font-weight: 600;
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
