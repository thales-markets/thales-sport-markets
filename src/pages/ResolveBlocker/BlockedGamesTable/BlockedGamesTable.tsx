import PaginationWrapper from 'components/PaginationWrapper';
import SPAAnchor from 'components/SPAAnchor';
import Table from 'components/Table';
import i18n from 'i18n';
import useWhitelistedForUnblock from 'queries/resolveBlocker/useWhitelistedForUnblock';
import React, { FC, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CellProps } from 'react-table';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { formatTxTimestamp, getEtherscanAddressLink, getEtherscanTxLink, truncateAddress } from 'thales-utils';
import { BlockedGame, BlockedGames } from 'types/resolveBlocker';
import { ThemeInterface } from 'types/ui';
import { buildMarketLink } from 'utils/routes';
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
        const isAppReady = useSelector(getIsAppReady);
        const networkId = useSelector(getNetworkId);
        const isWalletConnected = useSelector(getIsWalletConnected);
        const walletAddress = useSelector(getWalletAddress) || '';

        const [isWitelistedForUnblock, setIsWitelistedForUnblock] = useState<boolean>(false);

        const whitelistedForUnblockQuery = useWhitelistedForUnblock(walletAddress, networkId, {
            enabled: isAppReady && isWalletConnected,
        });

        useEffect(() => {
            if (whitelistedForUnblockQuery.isSuccess && whitelistedForUnblockQuery.data !== undefined) {
                setIsWitelistedForUnblock(whitelistedForUnblockQuery.data);
            }
        }, [whitelistedForUnblockQuery]);

        const [page, setPage] = useState(0);
        const handleChangePage = (_event: unknown, newPage: number) => {
            setPage(newPage);
        };

        const [rowsPerPage, setRowsPerPage] = useState(20);
        const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
        };

        useEffect(() => setPage(0), [blockedGames.length]);

        // @ts-ignore
        return (
            <>
                <Table
                    tableHeadCellStyles={{
                        color: theme.textColor.secondary,
                    }}
                    columnsDeps={[isWitelistedForUnblock, networkId]}
                    columns={[
                        {
                            Header: <>{t('resolve-blocker.date-time')}</>,
                            accessor: 'timestamp',
                            Cell: (cellProps: CellProps<BlockedGame, BlockedGame['timestamp']>) => (
                                <ExternalLink
                                    href={getEtherscanTxLink(networkId, cellProps.cell.row.original.hash)}
                                    target={'_blank'}
                                >
                                    <p>{formatTxTimestamp(cellProps.cell.value)}</p>
                                </ExternalLink>
                            ),
                            sortable: true,
                            width: '160px',
                        },
                        {
                            Header: <>{t('resolve-blocker.game')}</>,
                            accessor: 'homeTeam',
                            Cell: (cellProps: CellProps<BlockedGame, BlockedGame['homeTeam']>) => {
                                const hasGameInfo = cellProps.cell.value !== '';
                                return (
                                    <SPAAnchor href={buildMarketLink(cellProps.cell.row.original.gameId, language)}>
                                        <FlexDivColumn>
                                            <TeamNamesContainer width="auto">
                                                <TeamNameLabel>
                                                    {hasGameInfo
                                                        ? cellProps.cell.value
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
                            sortable: false,
                        },
                        {
                            Header: <>{t('resolve-blocker.reason')}</>,
                            accessor: 'reason',
                            Cell: (cellProps: CellProps<BlockedGame, BlockedGame['reason']>) => (
                                <p>{cellProps.cell.value}</p>
                            ),
                            sortable: true,
                        },
                        {
                            Header: <>{t(isUnblocked ? 'resolve-blocker.unblocked-by' : 'resolve-blocker.action')}</>,
                            accessor: 'unblockedBy',
                            Cell: (cellProps: CellProps<BlockedGame, BlockedGame['unblockedBy']>) => {
                                return isUnblocked ? (
                                    <ExternalLink
                                        href={getEtherscanAddressLink(networkId, cellProps.cell.value)}
                                        target={'_blank'}
                                    >
                                        <p>{truncateAddress(cellProps.cell.value)}</p>
                                    </ExternalLink>
                                ) : (
                                    <UnblockAction
                                        gameId={cellProps.cell.row.original.gameId}
                                        isWitelistedForUnblock={isWitelistedForUnblock}
                                    />
                                );
                            },
                            sortable: false,
                            width: '160px',
                        },
                    ]}
                    data={blockedGames}
                    isLoading={isLoading}
                    noResultsMessage={noResultsMessage}
                    tableRowHeadStyles={{ minHeight: '32px' }}
                    tableRowStyles={{ minHeight: '32px' }}
                    onSortByChanged={() => setPage(0)}
                    currentPage={page}
                    rowsPerPage={rowsPerPage}
                />
                {!isLoading && blockedGames.length > 0 && (
                    <PaginationWrapper
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        count={blockedGames.length}
                        labelRowsPerPage={t(`common.pagination.rows-per-page`)}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                )}
            </>
        );
    }
);

export default BlockedGamesTable;
