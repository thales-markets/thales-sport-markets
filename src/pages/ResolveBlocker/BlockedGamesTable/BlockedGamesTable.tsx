import SPAAnchor from 'components/SPAAnchor';
import Table from 'components/Table';
import i18n from 'i18n';
import useWhitelistedForUnblock from 'queries/resolveBlocker/useWhitelistedForUnblock';
import React, { FC, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { useTheme } from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { formatTxTimestamp, getEtherscanAddressLink, getEtherscanTxLink, truncateAddress } from 'thales-utils';
import { BlockedGames } from 'types/resolveBlocker';
import { ThemeInterface } from 'types/ui';
import { buildMarketLink } from 'utils/routes';
import { useAccount, useChainId, useClient } from 'wagmi';
import {
    TeamNameLabel,
    TeamNamesContainer,
} from '../../Markets/Market/MarketDetailsV2/components/TicketTransactionsTable/styled-components';
import UnblockAction from '../UnblockAction';
import { ExternalLink } from '../styled-components';

type BlockedGamesTableProps = {
    blockedGames: BlockedGames;
    noResultsMessage?: React.ReactNode;
    isLoading: boolean;
    isUnblocked: boolean;
};

const BlockedGamesTable: FC<BlockedGamesTableProps> = memo(
    ({ blockedGames, noResultsMessage, isLoading, isUnblocked }) => {
        const language = i18n.language;
        const { t } = useTranslation();
        const theme: ThemeInterface = useTheme();
        const isMobile = useSelector(getIsMobile);
        const networkId = useChainId();
        const client = useClient();
        const { address, isConnected } = useAccount();
        const walletAddress = address || '';

        const [isWitelistedForUnblock, setIsWitelistedForUnblock] = useState<boolean>(false);

        const whitelistedForUnblockQuery = useWhitelistedForUnblock(
            walletAddress,
            { networkId, client },
            {
                enabled: isConnected,
            }
        );

        useEffect(() => {
            if (whitelistedForUnblockQuery.isSuccess && whitelistedForUnblockQuery.data !== undefined) {
                setIsWitelistedForUnblock(whitelistedForUnblockQuery.data);
            }
        }, [whitelistedForUnblockQuery]);

        return (
            <Table
                tableHeadCellStyles={{
                    color: theme.textColor.secondary,
                }}
                columnsDeps={[isWitelistedForUnblock, networkId]}
                columns={
                    [
                        {
                            header: <>{t('resolve-blocker.date-time')}</>,
                            accessorKey: 'timestamp',
                            cell: (cellProps: any) => {
                                return (
                                    <ExternalLink
                                        href={getEtherscanTxLink(networkId, cellProps.cell.row.original.hash)}
                                        target={'_blank'}
                                    >
                                        <p>{formatTxTimestamp(cellProps.cell.getValue())}</p>
                                    </ExternalLink>
                                );
                            },
                            enableSorting: true,
                            sortDescFirst: true,
                            size: 160,
                        },
                        {
                            header: <>{t('resolve-blocker.game')}</>,
                            accessorKey: 'homeTeam',
                            cell: (cellProps: any) => {
                                const hasGameInfo = cellProps.cell.getValue() !== '';
                                return (
                                    <SPAAnchor href={buildMarketLink(cellProps.cell.row.original.gameId, language)}>
                                        <FlexDivColumn>
                                            <TeamNamesContainer width="auto">
                                                <TeamNameLabel>
                                                    {hasGameInfo
                                                        ? cellProps.cell.getValue()
                                                        : truncateAddress(cellProps.cell.row.original.gameId, 10)}
                                                </TeamNameLabel>
                                                {!isMobile && hasGameInfo && (
                                                    <TeamNameLabel>&nbsp;-&nbsp;</TeamNameLabel>
                                                )}
                                                {hasGameInfo && (
                                                    <TeamNameLabel>
                                                        {cellProps.cell.row.original.awayTeam}
                                                    </TeamNameLabel>
                                                )}
                                            </TeamNamesContainer>
                                        </FlexDivColumn>
                                    </SPAAnchor>
                                );
                            },
                            enableSorting: false,
                            size: 380,
                        },
                        {
                            header: <>{t('resolve-blocker.reason')}</>,
                            accessorKey: 'reason',
                            cell: (cellProps: any) => <p>{cellProps.cell.getValue()}</p>,
                            enableSorting: true,
                            size: 380,
                        },
                        {
                            header: <>{t(isUnblocked ? 'resolve-blocker.unblocked-by' : 'resolve-blocker.action')}</>,
                            accessorKey: 'unblockedBy',
                            cell: (cellProps: any) => {
                                return isUnblocked ? (
                                    <ExternalLink
                                        href={getEtherscanAddressLink(networkId, cellProps.cell.getValue())}
                                        target={'_blank'}
                                    >
                                        <p>{truncateAddress(cellProps.cell.getValue())}</p>
                                    </ExternalLink>
                                ) : (
                                    <UnblockAction
                                        gameId={cellProps.cell.row.original.gameId}
                                        isWitelistedForUnblock={isWitelistedForUnblock}
                                    />
                                );
                            },
                            enableSorting: false,
                            size: 160,
                        },
                    ] as any
                }
                initialState={{
                    sorting: [
                        {
                            id: 'timestamp',
                            desc: true,
                        },
                    ],
                }}
                data={blockedGames}
                isLoading={isLoading}
                noResultsMessage={noResultsMessage}
                showPagination
                tableRowHeadStyles={{ minHeight: '32px' }}
                tableRowStyles={{ minHeight: '32px' }}
                rowsPerPage={20}
            />
        );
    }
);

export default BlockedGamesTable;
