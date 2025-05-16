import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { useTheme } from 'styled-components';
import { formatCurrencyWithSign, formatDateWithTime, truncateAddress } from 'thales-utils';
import { RootState } from 'types/redux';
import { Referrer } from 'types/referral';
import { ThemeInterface } from 'types/ui';
import { TableHeaderStyle, TableHeaderStyleMobile } from '../TradersTable/TradersTable';

type AffiliateLeaderboardProps = {
    referrers: Referrer[] | [];
    isLoading: boolean;
};

const AffiliateLeaderboard: React.FC<AffiliateLeaderboardProps> = ({ referrers, isLoading }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const noResultsMessage = t('referral.no-result');

    // const [page, setPage] = useState(0);
    // const handleChangePage = (_event: unknown, newPage: number) => {
    //     setPage(newPage);
    // };

    const [rowsPerPage] = useState(20);
    // const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setRowsPerPage(Number(event.target.value));
    //     setPage(0);
    // };

    return (
        <>
            <Table
                columns={
                    [
                        {
                            header: <>{t('referral.affiliate-leaderboard-table.address')}</>,
                            accessorKey: 'id',
                            Cell: (cellProps: any) => <>{truncateAddress(cellProps.cell.value)}</>,
                        },
                        {
                            header: <>{t('referral.affiliate-leaderboard-table.number-of-trades')}</>,
                            accessorKey: 'trades',
                            sortable: true,
                        },
                        {
                            header: <>{t('referral.affiliate-leaderboard-table.total-volume')}</>,
                            accessorKey: 'totalVolume',
                            sortable: true,
                            Cell: (cellProps: any) => <>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</>,
                        },
                        {
                            header: <>{t('referral.affiliate-leaderboard-table.total-earned')}</>,
                            accessorKey: 'totalEarned',
                            sortable: true,
                            Cell: (cellProps: any) => <>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</>,
                        },
                        {
                            header: <>{t('referral.affiliate-leaderboard-table.first-transaction')}</>,
                            accessorKey: 'timestamp',
                            Cell: (cellProps: any) => <>{formatDateWithTime(cellProps.cell.value)}</>,
                        },
                    ] as any
                }
                data={referrers}
                isLoading={isLoading}
                rowsPerPage={rowsPerPage}
                noResultsMessage={noResultsMessage}
                tableHeadCellStyles={{
                    ...(isMobile ? TableHeaderStyleMobile : TableHeaderStyle),
                    color: theme.textColor.secondary,
                }}
                tableRowStyles={{ minHeight: '50px', fontSize: '12px' }}
                showPagination={true}
            />
        </>
    );
};

export default AffiliateLeaderboard;
