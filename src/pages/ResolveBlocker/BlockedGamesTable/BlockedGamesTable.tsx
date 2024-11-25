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
import { BlockedGame, BlockedGames } from 'types/resolveBlocker';
import { getTeamNameV2 } from 'utils/marketsV2';
import { buildMarketLink } from 'utils/routes';
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

    // @ts-ignore
    return (
        <>
            <Table
                columns={[
                    {
                        Header: <>{t('resolve-blocker.game')}</>,
                        accessor: 'game',
                        Cell: (cellProps: CellProps<BlockedGame, BlockedGame['game']>) => (
                            <SPAAnchor href={buildMarketLink(cellProps.cell.value.gameId, language)}>
                                <FlexDivColumn>
                                    <TeamNamesContainer width="auto">
                                        <TeamNameLabel>{getTeamNameV2(cellProps.cell.value, 0)}</TeamNameLabel>
                                        {!cellProps.cell.value.isOneSideMarket &&
                                            !cellProps.cell.value.isPlayerPropsMarket && (
                                                <>
                                                    {!isMobile && <TeamNameLabel>&nbsp;-&nbsp;</TeamNameLabel>}
                                                    <TeamNameLabel>
                                                        {getTeamNameV2(cellProps.cell.value, 1)}
                                                    </TeamNameLabel>
                                                </>
                                            )}
                                    </TeamNamesContainer>
                                </FlexDivColumn>
                            </SPAAnchor>
                        ),
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
                        accessor: 'isBlocked',
                        Cell: (cellProps: CellProps<BlockedGame, BlockedGame['isBlocked']>) => (
                            <UnblockAction
                                gameId={cellProps.cell.row.original.game.gameId}
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
                columnsDeps={[isWitelistedForUnblock]}
            />
        </>
    );
});

export default BlockedGamesTable;
