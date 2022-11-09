import React from 'react';
import { ReferredTrader } from 'types/referral';
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

type TradersTableProps = {
    referredTraders: ReferredTrader[] | [];
    isLoading: boolean;
};

const TradersTable: React.FC<TradersTableProps> = ({ referredTraders, isLoading }) => {
    const { t } = useTranslation();
    const noResultsMessage = t('referral.no-result');
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
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
                tableHeadCellStyles={isMobile ? TableHeaderStyleMobile : TableHeaderStyle}
                tableRowStyles={{ minHeight: '50px', fontSize: '12px' }}
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

export const TableHeaderStyleMobile: React.CSSProperties = {
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '9px',
    lineHeight: '12px',
    textTransform: 'uppercase',
    color: '#5F6180',
    justifyContent: 'flex-start',
};

export default TradersTable;
