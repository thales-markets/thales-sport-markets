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
import { FlexDivColumn } from 'styles/common';
import { truncateAddress } from 'thales-utils';
import { BlockedGame, BlockedGames } from 'types/resolveBlocker';
import { buildMarketLink } from 'utils/routes';
import PaginationWrapper from '../../../components/PaginationWrapper';
import {
    TeamNameLabel,
    TeamNamesContainer,
} from '../../Markets/Market/MarketDetailsV2/components/TicketTransactionsTable/styled-components';
import UnblockAction from '../UnblockAction';

type BlockedGamesTableProps = {
    blockedGames: BlockedGames;
    noResultsMessage?: React.ReactNode;
    isLoading: boolean;
};

const BlockedGamesTable: FC<BlockedGamesTableProps> = memo(({ blockedGames, noResultsMessage, isLoading }) => {
    const language = i18n.language;
    const { t } = useTranslation();
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

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    useEffect(() => setPage(0), [blockedGames.length]);

    // @ts-ignore
    return (
        <>
            <Table
                columns={[
                    // {
                    //     Header: <>{t('resolve-blocker.date-time')}</>,
                    //     accessor: 'timestamp',
                    //     Cell: (cellProps: CellProps<BlockedGame, BlockedGame['timestamp']>) => (
                    //         <p>{formatTxTimestamp(cellProps.cell.value)}</p>
                    //     ),
                    //     sortable: true,
                    // },
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
                                            {!isMobile && hasGameInfo && <TeamNameLabel>&nbsp;-&nbsp;</TeamNameLabel>}
                                            {hasGameInfo && (
                                                <TeamNameLabel>{cellProps.cell.row.original.awayTeam}</TeamNameLabel>
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
                        Header: <>{t('resolve-blocker.action')}</>,
                        accessor: 'isUnblocked',
                        Cell: (cellProps: CellProps<BlockedGame, BlockedGame['isUnblocked']>) => (
                            <UnblockAction
                                gameId={cellProps.cell.row.original.gameId}
                                isWitelistedForUnblock={isWitelistedForUnblock}
                            />
                        ),
                        sortable: false,
                    },
                ]}
                data={blockedGames}
                isLoading={isLoading}
                noResultsMessage={noResultsMessage}
                tableRowHeadStyles={{ minHeight: '32px' }}
                tableRowStyles={{ minHeight: '32px' }}
                columnsDeps={[isWitelistedForUnblock, networkId]}
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
});

export default BlockedGamesTable;
