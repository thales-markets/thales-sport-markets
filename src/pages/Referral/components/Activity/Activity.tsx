import SPAAnchor from 'components/SPAAnchor';
import Table from 'components/Table';
import { ExternalArrow, getTableProps, StyledLink } from 'pages/Referral/styled-components';
import useAffiliateActivityQuery from 'queries/overdrop/useAffiliateActivityQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { formatCurrency, getEtherscanAddressLink, getEtherscanTxLink, truncateAddress } from 'thales-utils';
import { RootState } from 'types/redux';
import { useAccount, useChainId } from 'wagmi';

const Activity: React.FC = () => {
    const { t } = useTranslation();
    const noResultsMessage = t('referral.no-result');
    const networkId = useChainId();
    const { address } = useAccount();

    const activityQuery = useAffiliateActivityQuery(address || '');
    const activityData = activityQuery.data || [];

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <>
            <Table
                {...getTableProps(isMobile)}
                columns={
                    [
                        {
                            header: <>{t('referral.bets.table-headers.user')}</>,
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
                            header: <>{t('referral.bets.table-headers.timestamp')}</>,
                            accessorKey: 'timestamp',
                            sortable: true,
                            cell: (cellProps: any) => {
                                const timestamp = cellProps.cell.getValue();
                                const date = new Date(timestamp); // This auto-converts to local time

                                return date
                                    .toLocaleString('en-US', {
                                        month: 'short',
                                        day: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false, // 24-hour format
                                    })
                                    .replace(',', '');
                                return <>{date}</>;
                            },
                        },
                        {
                            header: <>{t('referral.bets.table-headers.scan-link')}</>,
                            accessorKey: 'scanLink',
                            sortable: true,
                            cell: (cellProps: any) => (
                                <SPAAnchor
                                    href={getEtherscanTxLink(
                                        Number(cellProps.row.original.network),
                                        cellProps.cell.getValue()
                                    )}
                                >
                                    <ExternalArrow className={'icon icon--arrow-external'} />
                                </SPAAnchor>
                            ),
                        },
                        {
                            header: <>{t('referral.bets.table-headers.value')}</>,
                            accessorKey: 'value',
                            sortable: true,
                            cell: (cellProps: any) => <>{formatCurrency(cellProps.cell.getValue(), 2)}</>,
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

export default Activity;
