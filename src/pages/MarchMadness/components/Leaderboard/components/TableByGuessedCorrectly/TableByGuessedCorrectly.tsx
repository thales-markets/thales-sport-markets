import Table from 'components/Table';
import Tooltip from 'components/Tooltip';
import { SUPPORTED_NETWORKS_NAMES } from 'constants/network';
import useLeaderboardByGuessedCorrectlyQuery, {
    LeaderboardByGuessedCorrectlyResponse,
} from 'queries/marchMadness/useLeaderboardByGuessedCorrectlyQuery';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumnNative } from 'styles/common';
import { getEtherscanAddressLink } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { ThemeInterface } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import { truncateAddress } from 'utils/formatters/string';
import { getFormattedRewardsAmount, getTeamNameById } from 'utils/marchMadness';
import { useAccount, useChainId } from 'wagmi';
import {
    Arrow,
    Champion,
    OverlayContainer,
    Owner,
    StickyRowTopTable,
    TableHeader,
    TableHeaderContainer,
    TableRowCell,
    WalletAddress,
} from '../TableByVolume/styled-components';

type TableByGuessedCorrectlyProps = {
    searchText: string;
    isMainHeight: boolean;
    setLength: (length: number) => void;
};

const NUMBER_OF_POSITIONS_TO_HIGHLIGHT = 20;
const HIDDEN_COLUMNS_MOBILE = ['network', 'bracketWinnerTeamId'];

const TableByGuessedCorrectly: React.FC<TableByGuessedCorrectlyProps> = ({ searchText, isMainHeight, setLength }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isMobile = useSelector(getIsMobile);
    const isBiconomy = useSelector(getIsBiconomy);

    const networkId = useChainId();
    const { address } = useAccount();
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const getMobileTokenRewardsColumn = (value: string) => {
        const parts = value.split('+');
        return parts.length > 1 ? (
            <>
                {parts[0].replace(' ', ' +')}
                <br />
                {parts[1].replace(' ', '')}
            </>
        ) : (
            <>{parts[0]}</>
        );
    };

    const columns = useMemo(
        () =>
            [
                {
                    header: <>{''}</>,
                    accessorKey: 'rank',
                    size: isMobile ? 30 : 100,
                },
                {
                    header: <>{t('march-madness.leaderboard.network')}</>,
                    accessorKey: 'network',
                    cell: (cellProps: any) => (
                        <>{SUPPORTED_NETWORKS_NAMES[cellProps.cell.getValue() as SupportedNetwork].shortName}</>
                    ),
                    size: 100,
                },
                {
                    header: <>{t('march-madness.leaderboard.bracket-id')}</>,
                    accessorKey: 'bracketId',
                    cell: (cellProps: any) => {
                        const supportedNetworkName =
                            SUPPORTED_NETWORKS_NAMES[(cellProps.row.original as any).network as SupportedNetwork];
                        const networkName = isMobile ? supportedNetworkName.shorthand : '';
                        return <>{`${networkName} #${cellProps.cell.getValue()}`}</>;
                    },
                    size: isMobile ? 65 : 100,
                },
                {
                    header: <>{t('march-madness.leaderboard.bracket-champion')}</>,
                    accessorKey: 'bracketWinnerTeamId',
                    cell: (cellProps: any) => <Champion>{getTeamNameById(cellProps.cell.getValue())}</Champion>,
                },
                {
                    header: <>{t('march-madness.leaderboard.owner')}</>,
                    accessorKey: 'owner',
                    cell: (cellProps: any) => (
                        <Owner>
                            <WalletAddress>
                                {isMobile ? truncateAddress(cellProps.cell.getValue(), 5) : cellProps.cell.getValue()}
                            </WalletAddress>
                            <a
                                href={getEtherscanAddressLink(
                                    (cellProps.row.original as any).network as SupportedNetwork,
                                    cellProps.cell.getValue()
                                )}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Arrow className={'icon icon--arrow-external'} />
                            </a>
                        </Owner>
                    ),
                    size: isMobile ? 120 : 500,
                    headStyle: { cssProperties: { minWidth: isMobile ? '100px' : '130px' } },
                },
                {
                    header: () => (
                        <>
                            {t('march-madness.leaderboard.guessed-games')}
                            <Tooltip
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
                    size: isMobile ? 50 : 150,
                },
                {
                    header: () => (
                        <>
                            {t('march-madness.leaderboard.rewards')}
                            <Tooltip
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
                        const formattedRewards = getFormattedRewardsAmount(
                            (cell.row.original as any).stableRewards,
                            (cell.row.original as any).tokenRewards
                        );
                        return isMobile ? getMobileTokenRewardsColumn(formattedRewards) : <>{formattedRewards}</>;
                    },
                    size: isMobile ? 100 : 200,
                },
            ].filter((column: any) => !isMobile || !HIDDEN_COLUMNS_MOBILE.includes(column.accessorKey)),
        [t, isMobile]
    );

    const leaderboardQuery = useLeaderboardByGuessedCorrectlyQuery(networkId);

    const data = useMemo(() => {
        if (leaderboardQuery.isSuccess && leaderboardQuery.data) return leaderboardQuery.data;
        return [];
    }, [leaderboardQuery.data, leaderboardQuery.isSuccess]);

    const myScores = useMemo(() => {
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
        if (myScores?.length) {
            const myScore = myScores[0];
            const supportedNetworkName = SUPPORTED_NETWORKS_NAMES[myScore.network as SupportedNetwork];
            const networkName = isMobile ? supportedNetworkName.shorthand : supportedNetworkName.shortName;
            const getColumnSize = (accessorKey: string) =>
                columns.find((column) => column.accessorKey === accessorKey)?.size || 150;
            return (
                <StickyRowTopTable myScore={true}>
                    <TableRowCell width={`${getColumnSize('rank')}px`}>{myScore.rank}</TableRowCell>
                    {!isMobile && <TableRowCell width={`${getColumnSize('network')}px`}>{networkName}</TableRowCell>}
                    <TableRowCell width={`${getColumnSize('bracketId')}px`}>
                        {`${isMobile ? `${networkName} ` : ''}#${myScore.bracketId}`}
                    </TableRowCell>
                    {!isMobile && (
                        <TableRowCell width={`${getColumnSize('bracketWinnerTeamId')}px`}>
                            {getTeamNameById(myScore.bracketWinnerTeamId)}
                        </TableRowCell>
                    )}
                    <TableRowCell width={`${getColumnSize('owner')}px`}>
                        {t('march-madness.leaderboard.my-rewards-bracket').toUpperCase()}
                    </TableRowCell>
                    <TableRowCell width={`${getColumnSize('totalPoints')}px`}>{myScore.totalPoints}</TableRowCell>
                    <TableRowCell width={`${getColumnSize('tokenRewards')}px`} wrap={isMobile}>
                        {isMobile
                            ? getMobileTokenRewardsColumn(
                                  getFormattedRewardsAmount(myScore.stableRewards, myScore.tokenRewards)
                              )
                            : getFormattedRewardsAmount(myScore.stableRewards, myScore.tokenRewards)}
                    </TableRowCell>
                </StickyRowTopTable>
            );
        }
    }, [myScores, t, columns, isMobile]);

    useEffect(() => {
        setLength(filteredData.length);
    }, [setLength, filteredData.length]);

    return (
        <Container>
            <TableHeaderContainer>
                <TableHeader>{t('march-madness.leaderboard.by-guessed-correctly')}</TableHeader>
            </TableHeaderContainer>
            <Table
                data={filteredData}
                columns={columns as any}
                columnsDeps={[isMobile]}
                stickyRow={stickyRow}
                rowsPerPage={20}
                isLoading={leaderboardQuery.isLoading}
                noResultsMessage={t('march-madness.leaderboard.no-data')}
                showPagination
                tableHeight={isMainHeight ? 'unset' : filteredData.length ? '100%' : 'calc(100% - 114px)'}
                tableHeadTitleStyles={{ fontFamily: theme.fontFamily.primary, fontSize: '12px' }}
                tableRowHeadStyles={{
                    border: `2px solid ${theme.marchMadness.borderColor.secondary}`,
                    borderRadius: 'unset',
                    background: 'transparent',
                }}
                tableHeadCellStyles={{ justifyContent: isMobile ? 'center' : 'left' }}
                tableStyle={`border: 2px solid ${theme.marchMadness.borderColor.secondary};  border-top: 0px; ${
                    isMainHeight || !filteredData.length ? 'min-height: 450px;' : ''
                }`}
                tableBodyPadding="0px"
                tableRowStyles={{
                    background: `${theme.marchMadness.background.senary}`,
                    borderBottom: `1px solid ${theme.borderColor.secondary}`,
                }}
                highlightRowsByRank={NUMBER_OF_POSITIONS_TO_HIGHLIGHT}
                tableRowCellStyles={{
                    fontFamily: theme.fontFamily.primary,
                    padding: '10px 0px',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: '150%',
                    letterSpacing: '0.21px',
                    justifyContent: isMobile ? 'center' : 'left',
                }}
                noResultsStyle={{
                    fontFamily: theme.fontFamily.primary,
                    fontSize: '25px',
                    lineHeight: '40px',
                    color: theme.marchMadness.textColor.senary,
                    textTransform: 'uppercase',
                    width: '150px',
                    textAlign: 'center',
                    height: 'unset',
                    padding: 0,
                }}
            />
        </Container>
    );
};

const Container = styled(FlexDivColumnNative)`
    height: auto;
    flex: 8;
`;

export default TableByGuessedCorrectly;
