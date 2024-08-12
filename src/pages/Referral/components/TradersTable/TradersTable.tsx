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
import { ReferredTrader } from 'types/referral';
import { ThemeInterface } from 'types/ui';

type TradersTableProps = {
    referredTraders: ReferredTrader[] | [];
    isLoading: boolean;
};

const TradersTable: React.FC<TradersTableProps> = ({ referredTraders, isLoading }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const noResultsMessage = t('referral.no-result');
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [page, setPage] = useState(0);
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const [rowsPerPage, setRowsPerPage] = useState(20);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    return (
        <>
            <Table
                columns={[
                    {
                        Header: <>{t('referral.affiliate-leaderboard-table.address')}</>,
                        accessor: 'id',
                        Cell: (cellProps: CellProps<ReferredTrader, ReferredTrader['id']>) => (
                            <>{truncateAddress(cellProps.cell.value)}</>
                        ),
                    },
                    {
                        Header: <>{t('referral.affiliate-leaderboard-table.number-of-trades')}</>,
                        accessor: 'trades',
                        sortable: true,
                    },
                    {
                        Header: <>{t('referral.affiliate-leaderboard-table.total-volume')}</>,
                        accessor: 'totalVolume',
                        sortable: true,
                        Cell: (cellProps: CellProps<ReferredTrader, ReferredTrader['totalVolume']>) => (
                            <>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</>
                        ),
                    },
                    {
                        Header: <>{t('referral.affiliate-leaderboard-table.total-earned')}</>,
                        accessor: 'totalAmount',
                        sortable: true,
                        Cell: (cellProps: CellProps<ReferredTrader, ReferredTrader['totalAmount']>) => (
                            <>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</>
                        ),
                    },
                    {
                        Header: <>{t('referral.affiliate-leaderboard-table.first-transaction')}</>,
                        accessor: 'timestamp',
                        Cell: (cellProps: CellProps<ReferredTrader, ReferredTrader['timestamp']>) => (
                            <>{formatDateWithTime(cellProps.cell.value)}</>
                        ),
                    },
                ]}
                data={referredTraders}
                isLoading={isLoading}
                noResultsMessage={noResultsMessage}
                tableHeadCellStyles={{
                    ...(isMobile ? TableHeaderStyleMobile : TableHeaderStyle),
                    color: theme.textColor.secondary,
                }}
                tableRowStyles={{ minHeight: '50px', fontSize: '12px' }}
                rowsPerPage={rowsPerPage}
                currentPage={page}
            />
            <PaginationWrapper
                rowsPerPageOptions={[10, 20, 50, 100]}
                count={referredTraders.length ? referredTraders.length : 0}
                labelRowsPerPage={t(`common.pagination.rows-per-page`)}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    );
};

export const TableHeaderStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: '12px',
    lineHeight: '12px',
    textTransform: 'uppercase',
    justifyContent: 'flex-start',
};

export const TableHeaderStyleMobile: React.CSSProperties = {
    fontWeight: 600,
    fontSize: '9px',
    lineHeight: '12px',
    textTransform: 'uppercase',
    justifyContent: 'flex-start',
};

export default TradersTable;
