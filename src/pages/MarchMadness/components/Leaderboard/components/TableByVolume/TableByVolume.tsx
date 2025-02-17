import Table from 'components/Table';
import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import useLeaderboardByVolumeQuery, { LeaderboardByVolumeData } from 'queries/marchMadness/useLeaderboardByVolumeQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { formatCurrencyWithKey, getEtherscanAddressLink } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { truncateAddress } from 'utils/formatters/string';
import { useAccount, useChainId } from 'wagmi';
import {
    Arrow,
    Container,
    OverlayContainer,
    StickyRow,
    TableHeader,
    TableHeaderContainer,
    TableRowCell,
    WalletAddress,
} from './styled-components';

type TableByVolumeProps = {
    searchText: string;
};

const TableByVolume: React.FC<TableByVolumeProps> = ({ searchText }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isBiconomy = useSelector(getIsBiconomy);

    const networkId = useChainId();
    const { address } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const columns = useMemo(() => {
        return [
            {
                header: <>{''}</>,
                accessorKey: 'rank',
            },
            {
                header: <>{t('march-madness.leaderboard.address')}</>,
                accessorKey: 'walletAddress',
                cell: (cellProps: any) => (
                    <WalletAddress>
                        {truncateAddress(cellProps.cell.getValue(), 5)}
                        <a
                            href={getEtherscanAddressLink(networkId, cellProps.cell.getValue())}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Arrow />
                        </a>
                    </WalletAddress>
                ),
            },
            {
                header: <>{t('march-madness.leaderboard.volume')}</>,
                accessorKey: 'volume',
                cell: (cellProps: any) => <>{formatCurrencyWithKey(USD_SIGN, cellProps.cell.getValue(), 2)}</>,
            },
            {
                header: () => (
                    <>
                        {t('march-madness.leaderboard.rewards')}
                        <Tooltip
                            overlayInnerStyle={{
                                backgroundColor: theme.marchMadness.background.secondary,
                                border: `1px solid ${theme.marchMadness.borderColor.primary}`,
                            }}
                            overlay={
                                <OverlayContainer>
                                    {t('march-madness.leaderboard.tooltip-rewards-volume-table')}
                                </OverlayContainer>
                            }
                            iconFontSize={14}
                            marginLeft={2}
                            top={0}
                        />
                    </>
                ),
                accessorKey: 'estimatedRewards',
                cell: (cellProps: any) => <>{formatCurrencyWithKey('ARB', cellProps.cell.getValue(), 2)}</>,
            },
        ];
    }, [networkId, t, theme.marchMadness.borderColor.primary, theme.marchMadness.background.secondary]);

    const leaderboardQuery = useLeaderboardByVolumeQuery(networkId);

    const data = useMemo(() => {
        if (leaderboardQuery.isSuccess && leaderboardQuery.data) return leaderboardQuery.data;
        return [];
    }, [leaderboardQuery.data, leaderboardQuery.isSuccess]);

    const myScore = useMemo(() => {
        if (data) {
            return data.filter((user) => user.walletAddress.toLowerCase() == walletAddress?.toLowerCase());
        }
        return [];
    }, [data, walletAddress]);

    const filteredData = useMemo(() => {
        if (data) {
            let finalData: LeaderboardByVolumeData = [];

            finalData = data;

            if (searchText.trim() !== '') {
                finalData = data.filter((user) => user.walletAddress.toLowerCase().includes(searchText.toLowerCase()));
            }

            return finalData;
        }
        return [];
    }, [data, searchText]);

    const stickyRow = useMemo(() => {
        if (myScore?.length) {
            return (
                <StickyRow myScore={true}>
                    <TableRowCell>{myScore[0].rank}</TableRowCell>
                    <TableRowCell>{t('march-madness.leaderboard.my-rewards').toUpperCase()}</TableRowCell>
                    <TableRowCell>{formatCurrencyWithKey(USD_SIGN, myScore[0].volume, 2)}</TableRowCell>
                    <TableRowCell> {formatCurrencyWithKey('ARB', myScore[0].estimatedRewards, 2)}</TableRowCell>
                </StickyRow>
            );
        }
    }, [myScore, t]);

    return (
        <Container>
            <TableHeaderContainer>
                <TableHeader>{t('march-madness.leaderboard.by-volume')}</TableHeader>
            </TableHeaderContainer>
            {filteredData?.length > 0 && (
                <Table
                    data={filteredData}
                    columns={columns as any}
                    stickyRow={stickyRow}
                    rowsPerPage={20}
                    isLoading={leaderboardQuery.isLoading}
                    noResultsMessage={t('march-madness.leaderboard.no-data')}
                    showPagination
                />
            )}
        </Container>
    );
};

export default TableByVolume;
