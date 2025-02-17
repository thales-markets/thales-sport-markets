import Table from 'components/Table';
import Tooltip from 'components/Tooltip';
import useLeaderboardByGuessedCorrectlyQuery, {
    LeaderboardByGuessedCorrectlyResponse,
} from 'queries/marchMadness/useLeaderboardByGuessedCorrectlyQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { getEtherscanAddressLink } from 'thales-utils';
import { ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { truncateAddress } from 'utils/formatters/string';
import { getFormattedRewardsAmount } from 'utils/marchMadness';
import { useAccount, useChainId } from 'wagmi';
import {
    Arrow,
    OverlayContainer,
    StickyRowTopTable,
    TableHeader,
    TableHeaderContainer,
    TableRowCell,
    WalletAddress,
} from '../TableByVolume/styled-components';

type TableByGuessedCorrectlyProps = {
    searchText: string;
};

// const NUMBER_OF_POSITIONS_TO_HIGHLIGHT = 20; // TODO: highlight first 20

const TableByGuessedCorrectly: React.FC<TableByGuessedCorrectlyProps> = ({ searchText }) => {
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
                header: <>{t('march-madness.leaderboard.bracket-id')}</>,
                accessorKey: 'bracketId',
                cell: (cellProps: any) => <>#{cellProps.cell.getValue()}</>,
            },
            {
                header: <>{t('march-madness.leaderboard.owner')}</>,
                accessorKey: 'owner',
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
                header: () => (
                    <>
                        {t('march-madness.leaderboard.guessed-games')}
                        <Tooltip
                            overlayInnerStyle={{
                                backgroundColor: theme.marchMadness.background.secondary,
                                border: `1px solid ${theme.marchMadness.borderColor.primary}`,
                            }}
                            overlay={
                                <OverlayContainer>
                                    {t('march-madness.leaderboard.tooltip-correct-correct-table')}
                                </OverlayContainer>
                            }
                            iconFontSize={14}
                            marginLeft={2}
                            top={0}
                        />
                    </>
                ),
                accessorKey: 'totalPoints',
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
                                    {t('march-madness.leaderboard.tooltip-rewards-correct-table')}
                                </OverlayContainer>
                            }
                            iconFontSize={14}
                            marginLeft={2}
                            top={0}
                        />
                    </>
                ),
                accessorKey: 'tokenRewards',
                cell: (cell: any) => {
                    return (
                        <>
                            {getFormattedRewardsAmount(
                                (cell.row.original as any).stableRewards,
                                (cell.row.original as any).tokenRewards
                            )}
                        </>
                    );
                },
            },
        ];
    }, [t, networkId, theme.marchMadness.borderColor.primary, theme.marchMadness.background.secondary]);

    const leaderboardQuery = useLeaderboardByGuessedCorrectlyQuery(networkId);

    const data = useMemo(() => {
        if (leaderboardQuery.isSuccess && leaderboardQuery.data) return leaderboardQuery.data;
        return [];
    }, [leaderboardQuery.data, leaderboardQuery.isSuccess]);

    const myScore = useMemo(() => {
        if (data) {
            return data.filter((user) => user.owner.toLowerCase() == walletAddress?.toLowerCase());
        }
        return [];
    }, [data, walletAddress]);

    const filteredData = useMemo(() => {
        let finalData: LeaderboardByGuessedCorrectlyResponse = [];
        if (data) {
            finalData = data;

            if (searchText?.trim() !== '') {
                finalData = data.filter((user) => user.owner.toLowerCase().includes(searchText.toLowerCase()));
            }

            return finalData;
        }

        return [];
    }, [data, searchText]);

    const stickyRow = useMemo(() => {
        if (myScore?.length) {
            return (
                <StickyRowTopTable myScore={true}>
                    <TableRowCell>{myScore[0].rank}</TableRowCell>
                    <TableRowCell>#{myScore[0].bracketId}</TableRowCell>
                    <TableRowCell>{t('march-madness.leaderboard.my-rewards-bracket').toUpperCase()}</TableRowCell>
                    <TableRowCell>{myScore[0].totalPoints}</TableRowCell>
                    <TableRowCell>
                        {getFormattedRewardsAmount(myScore[0].stableRewards, myScore[0].tokenRewards)}
                    </TableRowCell>
                </StickyRowTopTable>
            );
        }
    }, [myScore, t]);

    return (
        <Container>
            <TableHeaderContainer>
                <TableHeader>{t('march-madness.leaderboard.by-guessed-correctly')}</TableHeader>
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

const Container = styled.div`
    flex: 8;
`;

export default TableByGuessedCorrectly;
