import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { getTableProps, StyledLink } from 'pages/Referral/styled-components';
import useAffiliateSummaryQuery from 'queries/overdrop/useAffiliateSummaryQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { formatCurrency, formatCurrencyWithSign, getEtherscanAddressLink, truncateAddress } from 'thales-utils';
import { RootState } from 'types/redux';
import { useAccount, useChainId } from 'wagmi';

const Summary: React.FC = () => {
    const { t } = useTranslation();
    const noResultsMessage = t('referral.no-result');
    const networkId = useChainId();
    const { address } = useAccount();

    const activityQuery = useAffiliateSummaryQuery(address || '');
    const activityData = activityQuery.data || [];

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <>
            <Table
                {...getTableProps(isMobile)}
                columns={
                    [
                        {
                            header: <>{t('referral.activity.table-headers.user')}</>,
                            accessorKey: 'user',
                            cell: (cellProps: any) => (
                                <StyledLink
                                    href={getEtherscanAddressLink(networkId, cellProps.cell.getValue())}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {truncateAddress(cellProps.cell.getValue(), 4, 4)}
                                </StyledLink>
                            ),
                        },
                        {
                            header: <>{t('referral.activity.table-headers.date-joined')}</>,
                            accessorKey: 'dateJoined',
                        },
                        {
                            header: <>{t('referral.activity.table-headers.total-bets')}</>,
                            accessorKey: 'totalBets',
                        },
                        {
                            header: <>{t('referral.activity.table-headers.bet-volume')}</>,
                            accessorKey: 'betVolume',
                            cell: (cellProps: any) => (
                                <>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue(), 2)}</>
                            ),
                        },
                        {
                            header: <>{t('referral.activity.table-headers.xp-generated')}</>,
                            accessorKey: 'xpGenerated',
                            cell: (cellProps: any) => <>{formatCurrency(cellProps.cell.getValue(), 2)}</>,
                        },
                        {
                            header: <>{t('referral.activity.table-headers.xp-earned')}</>,
                            accessorKey: 'yourXpEarned',
                            cell: (cellProps: any) => <>{formatCurrency(cellProps.cell.getValue(), 2)}</>,
                            size: 270,
                        },
                    ] as any
                }
                data={activityData}
                isLoading={false}
                rowsPerPage={20}
                noResultsMessage={noResultsMessage}
                showPagination={true}
                solidBorder
            />
        </>
    );
};

export default Summary;
