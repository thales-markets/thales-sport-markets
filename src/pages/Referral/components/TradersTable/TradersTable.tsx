import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { useTheme } from 'styled-components';
import { formatCurrencyWithSign, formatDateWithTime, truncateAddress } from 'thales-utils';
import { RootState } from 'types/redux';
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
                            accessorKey: 'totalAmount',
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
                data={referredTraders}
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
