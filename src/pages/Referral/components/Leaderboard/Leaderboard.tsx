import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { getTableProps, RankNumber, UserXP } from 'pages/Referral/styled-components';
import useAffiliateLeaderboardQuery from 'queries/overdrop/useAffiliateLeaderboardQuery';
import useOverdropLeaderboardQuery from 'queries/overdrop/useOverdropLeaderboardQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { formatCurrency, formatCurrencyWithSign, truncateAddress } from 'thales-utils';
import { RootState } from 'types/redux';
import { getCurrentLevelByPoints } from 'utils/overdrop';

const Leaderboard: React.FC = () => {
    const { t } = useTranslation();
    const noResultsMessage = t('referral.no-result');

    const overdropLeaderboardQuery = useOverdropLeaderboardQuery();

    const overdropLeaderboard = useMemo(
        () =>
            overdropLeaderboardQuery.isSuccess
                ? overdropLeaderboardQuery.data.map((row) => ({ ...row, level: getCurrentLevelByPoints(row.points) }))
                : [],
        [overdropLeaderboardQuery.isSuccess, overdropLeaderboardQuery.data]
    );

    const leaderboardQuery = useAffiliateLeaderboardQuery();
    const leaderboard = useMemo(() => leaderboardQuery.data || [], [leaderboardQuery.data]);

    const tableData = useMemo(() => {
        return leaderboard.map((row) => {
            return {
                ...row,
                level: getCurrentLevelByPoints(
                    overdropLeaderboard.find((oRow) => row.owner === oRow.address)?.points || 0
                ),
            };
        });
    }, [leaderboard, overdropLeaderboard]);

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <>
            <Table
                {...getTableProps(isMobile)}
                columns={
                    [
                        {
                            header: <>{t('referral.leaderboard.table-headers.rank')}</>,
                            accessorKey: 'rank',
                            cell: (cellProps: any) => {
                                const rank = cellProps.cell.getValue();
                                return (
                                    <>
                                        <RankNumber>{rank}</RankNumber>
                                    </>
                                );
                            },
                            size: 100,
                        },
                        {
                            header: <>{t('referral.leaderboard.table-headers.user')}</>,
                            accessorKey: 'owner',
                            sortable: true,
                            cell: (cellProps: any) => <>{truncateAddress(cellProps.cell.getValue(), 4, 4)}</>,
                            size: 110,
                        },
                        {
                            header: <>{t('referral.leaderboard.table-headers.total-bets')}</>,
                            accessorKey: 'totalBets',
                            sortable: true,
                            size: 150,
                        },
                        {
                            header: <>{t('referral.leaderboard.table-headers.referrals')}</>,
                            accessorKey: 'referrals',
                            sortable: true,
                            size: 150,
                        },
                        {
                            header: <>{t('referral.leaderboard.table-headers.betVolume')}</>,
                            accessorKey: 'betVolume',
                            cell: (cellProps: any) => (
                                <>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue(), 2)}</>
                            ),
                        },
                        {
                            header: <>{t('referral.leaderboard.table-headers.xp')}</>,
                            accessorKey: 'xp',
                            cell: (cellProps: any) => <UserXP>{formatCurrency(cellProps.cell.getValue(), 2)}</UserXP>,
                            size: 170,
                        },
                    ].concat(
                        isMobile
                            ? []
                            : [
                                  {
                                      header: <>{t('referral.leaderboard.table-headers.level')}</>,
                                      accessorKey: 'level.levelName',
                                      cell: (cellProps: any) => <>{cellProps.cell.getValue()}</>,
                                      size: 200,
                                  },
                              ]
                    ) as any
                }
                data={tableData}
                isLoading={false}
                rowsPerPage={20}
                noResultsMessage={noResultsMessage}
                showPagination={true}
                solidBorder
            />
        </>
    );
};

export default Leaderboard;
