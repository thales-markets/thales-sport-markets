import SPAAnchor from 'components/SPAAnchor';
import Table from 'components/Table';
import { ExternalArrow, getTableProps } from 'pages/Referral/styled-components';
import useAffiliateActivityQuery from 'queries/overdrop/useAffiliateActivityQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import { formatCurrency, getEtherscanTxLink, truncateAddress } from 'thales-utils';
import { RootState } from 'types/redux';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import { useAccount, useChainId } from 'wagmi';

const Activity: React.FC = () => {
    const { t } = useTranslation();
    const noResultsMessage = t('referral.no-result');

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const { address } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';
    const networkId = useChainId();

    const activityQuery = useAffiliateActivityQuery(walletAddress);
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
                            cell: (cellProps: any) => <>{truncateAddress(cellProps.cell.getValue(), 4, 4)}</>,
                        },
                        {
                            header: <>{t('referral.bets.table-headers.timestamp')}</>,
                            accessorKey: 'timestamp',
                            sortable: true,
                        },
                        {
                            header: <>{t('referral.bets.table-headers.scan-link')}</>,
                            accessorKey: 'scanLink',
                            sortable: true,
                            cell: (cellProps: any) => (
                                <SPAAnchor href={getEtherscanTxLink(networkId, cellProps.cell.getValue())}>
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
