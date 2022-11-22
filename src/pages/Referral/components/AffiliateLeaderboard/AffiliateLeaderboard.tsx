import React, { useState } from 'react';
import { Referrer } from 'types/referral';
import Table from 'components/Table';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { truncateAddress } from 'utils/formatters/string';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { USD_SIGN } from 'constants/currency';
import { formatDateWithTime } from 'utils/formatters/date';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsMobile } from 'redux/modules/app';
import { TableHeaderStyleMobile } from '../TradersTable/TradersTable';
import { PaginationWrapper } from 'pages/Quiz/styled-components';

type AffiliateLeaderboardProps = {
    referrers: Referrer[] | [];
    isLoading: boolean;
};

const AffiliateLeaderboard: React.FC<AffiliateLeaderboardProps> = ({ referrers, isLoading }) => {
    const { t } = useTranslation();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const noResultsMessage = t('referral.no-result');

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
                        Cell: (cellProps: CellProps<Referrer, Referrer['id']>) => (
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
                        Cell: (cellProps: CellProps<Referrer, Referrer['totalVolume']>) => (
                            <>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</>
                        ),
                    },
                    {
                        Header: <>{t('referral.affiliate-leaderboard-table.total-earned')}</>,
                        accessor: 'totalEarned',
                        sortable: true,
                        Cell: (cellProps: CellProps<Referrer, Referrer['totalEarned']>) => (
                            <>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</>
                        ),
                    },
                    {
                        Header: <>{t('referral.affiliate-leaderboard-table.first-transaction')}</>,
                        accessor: 'timestamp',
                        Cell: (cellProps: CellProps<Referrer, Referrer['timestamp']>) => (
                            <>{formatDateWithTime(cellProps.cell.value)}</>
                        ),
                    },
                ]}
                data={referrers}
                isLoading={isLoading}
                rowsPerPage={rowsPerPage}
                currentPage={page}
                noResultsMessage={noResultsMessage}
                tableHeadCellStyles={isMobile ? TableHeaderStyleMobile : TableHeaderStyle}
                tableRowStyles={{ minHeight: '50px', fontSize: '12px' }}
            />
            <PaginationWrapper
                rowsPerPageOptions={[10, 20, 50, 100]}
                count={referrers.length ? referrers.length : 0}
                labelRowsPerPage={t(`common.pagination.rows-per-page`)}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    );
};

const TableHeaderStyle: React.CSSProperties = {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '12px',
    lineHeight: '12px',
    textTransform: 'uppercase',
    color: '#5F6180',
    justifyContent: 'flex-start',
};

export default AffiliateLeaderboard;
