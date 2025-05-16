import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { useTheme } from 'styled-components';
import { formatCurrencyWithSign, formatDateWithTime, truncateAddress } from 'thales-utils';
import { RootState } from 'types/redux';
import { ReferralTransaction } from 'types/referral';
import { ThemeInterface } from 'types/ui';
import { TableHeaderStyle, TableHeaderStyleMobile } from '../TradersTable/TradersTable';

type ReferralTransactionsTableProps = {
    transactions: ReferralTransaction[] | [];
    isLoading: boolean;
};

const ReferralTransactionsTable: React.FC<ReferralTransactionsTableProps> = ({ transactions, isLoading }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    // const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(20);

    // const handleChangePage = (_event: unknown, newPage: number) => {
    //     setPage(newPage);
    // };

    // const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setRowsPerPage(Number(event.target.value));
    //     setPage(0);
    // };

    const noResultsMessage = t('referral.no-result');
    return (
        <>
            <Table
                columns={
                    [
                        {
                            header: <>{t('referral.affiliate-leaderboard-table.address')}</>,
                            accessorKey: 'trader',
                            Cell: (cellProps: any) => <>{truncateAddress(cellProps.cell.value?.id)}</>,
                        },
                        {
                            header: <>{t('referral.affiliate-leaderboard-table.amount')}</>,
                            accessorKey: 'amount',
                            sortable: true,
                            Cell: (cellProps: any) => <>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</>,
                        },
                        {
                            header: <>{t('referral.affiliate-leaderboard-table.volume')}</>,
                            accessorKey: 'volume',
                            sortable: true,
                            Cell: (cellProps: any) => <>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</>,
                        },
                        {
                            header: <>{t('referral.affiliate-leaderboard-table.type')}</>,
                            accessorKey: 'ammType',
                            Cell: (cellProps: any) => <>{cellProps.cell.value.toUpperCase()}</>,
                        },
                        {
                            header: <>{t('referral.affiliate-leaderboard-table.timestamp')}</>,
                            accessorKey: 'timestamp',
                            Cell: (cellProps: any) => <>{formatDateWithTime(cellProps.cell.value)}</>,
                        },
                    ] as any
                }
                data={transactions}
                initialState={{
                    pageIndex: 0,
                }}
                isLoading={isLoading}
                noResultsMessage={noResultsMessage}
                tableHeadCellStyles={{
                    ...(isMobile ? TableHeaderStyleMobile : TableHeaderStyle),
                    color: theme.textColor.secondary,
                }}
                tableRowStyles={{ minHeight: '50px', fontSize: '12px' }}
                rowsPerPage={rowsPerPage}
                showPagination={true}
            />
        </>
    );
};

export default ReferralTransactionsTable;
