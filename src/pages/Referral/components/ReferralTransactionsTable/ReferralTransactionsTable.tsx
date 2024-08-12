import PaginationWrapper from 'components/PaginationWrapper';
import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CellProps } from 'react-table';
import { getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { useTheme } from 'styled-components';
import { formatCurrencyWithSign, formatDateWithTime, truncateAddress } from 'thales-utils';
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
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    const noResultsMessage = t('referral.no-result');
    return (
        <>
            <Table
                columns={[
                    {
                        Header: <>{t('referral.affiliate-leaderboard-table.address')}</>,
                        accessor: 'trader',
                        Cell: (cellProps: CellProps<ReferralTransaction, ReferralTransaction['trader']>) => (
                            <>{truncateAddress(cellProps.cell.value?.id)}</>
                        ),
                    },
                    {
                        Header: <>{t('referral.affiliate-leaderboard-table.amount')}</>,
                        accessor: 'amount',
                        sortable: true,
                        Cell: (cellProps: CellProps<ReferralTransaction, ReferralTransaction['amount']>) => (
                            <>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</>
                        ),
                    },
                    {
                        Header: <>{t('referral.affiliate-leaderboard-table.volume')}</>,
                        accessor: 'volume',
                        sortable: true,
                        Cell: (cellProps: CellProps<ReferralTransaction, ReferralTransaction['volume']>) => (
                            <>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</>
                        ),
                    },
                    {
                        Header: <>{t('referral.affiliate-leaderboard-table.type')}</>,
                        accessor: 'ammType',
                        Cell: (cellProps: CellProps<ReferralTransaction, ReferralTransaction['ammType']>) => (
                            <>{cellProps.cell.value.toUpperCase()}</>
                        ),
                    },
                    {
                        Header: <>{t('referral.affiliate-leaderboard-table.timestamp')}</>,
                        accessor: 'timestamp',
                        Cell: (cellProps: CellProps<ReferralTransaction, ReferralTransaction['timestamp']>) => (
                            <>{formatDateWithTime(cellProps.cell.value)}</>
                        ),
                    },
                ]}
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
                onSortByChanged={() => setPage(0)}
                rowsPerPage={rowsPerPage}
                currentPage={page}
            />
            <PaginationWrapper
                rowsPerPageOptions={[10, 20, 50, 100]}
                count={transactions.length ? transactions.length : 0}
                labelRowsPerPage={t(`common.pagination.rows-per-page`)}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    );
};

export default ReferralTransactionsTable;
