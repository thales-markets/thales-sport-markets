import { t } from 'i18next';
import useBlockedGamesQuery from 'queries/resolveBlocker/useBlockedGamesQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { BlockedGames } from 'types/resolveBlocker';
import { ResolveBlockerTab } from '../../enums/resolveBlocker';
import BlockedGamesTable from './BlockedGamesTable';
import { Container, Tab, TabContainer } from './styled-components';

const ResolveBlocker: React.FC = () => {
    const networkId = useSelector(getNetworkId);
    const isAppReady = useSelector(getIsAppReady);
    const [lastValidBlockedGames, setLastValidBlockedGames] = useState<BlockedGames>([]);
    const [lastValidUnblockedGames, setLastValidUnblockedGames] = useState<BlockedGames>([]);
    const [selectedTab, setSelectedTab] = useState<ResolveBlockerTab>(ResolveBlockerTab.BLOCKED_GAMES);

    const blockedGamesQuery = useBlockedGamesQuery(false, networkId, {
        enabled: isAppReady,
    });
    useEffect(() => {
        if (blockedGamesQuery.isSuccess && blockedGamesQuery.data) {
            setLastValidBlockedGames(blockedGamesQuery.data);
        }
    }, [blockedGamesQuery]);

    const unblockedGamesQuery = useBlockedGamesQuery(true, networkId, {
        enabled: isAppReady,
    });
    useEffect(() => {
        if (unblockedGamesQuery.isSuccess && unblockedGamesQuery.data) {
            setLastValidUnblockedGames(unblockedGamesQuery.data);
        }
    }, [unblockedGamesQuery]);

    const noBlockedGames = lastValidBlockedGames.length === 0;
    const noUnblockedGames = lastValidUnblockedGames.length === 0;

    const tabContent: Array<{
        id: ResolveBlockerTab;
        name: string;
    }> = useMemo(
        () => [
            {
                id: ResolveBlockerTab.BLOCKED_GAMES,
                name: t(`resolve-blocker.tab.blocked-games`),
            },
            {
                id: ResolveBlockerTab.UNBLOCKED_GAMES,
                name: t(`resolve-blocker.tab.unblocked-games`),
            },
        ],
        []
    );

    return (
        <Container>
            <TabContainer>
                {tabContent.map((tab, index) => (
                    <Tab
                        isActive={tab.id === selectedTab}
                        key={index}
                        index={index}
                        onClick={() => {
                            setSelectedTab(tab.id);
                        }}
                        className={`${tab.id === selectedTab ? 'selected' : ''}`}
                    >
                        {tab.name}
                    </Tab>
                ))}
            </TabContainer>
            {selectedTab === ResolveBlockerTab.BLOCKED_GAMES && (
                <BlockedGamesTable
                    blockedGames={lastValidBlockedGames}
                    isLoading={blockedGamesQuery.isLoading}
                    noResultsMessage={noBlockedGames ? <span>{t(`resolve-blocker.no-blocked-games`)}</span> : undefined}
                    isUnblocked={false}
                />
            )}
            {selectedTab === ResolveBlockerTab.UNBLOCKED_GAMES && (
                <BlockedGamesTable
                    blockedGames={lastValidUnblockedGames}
                    isLoading={unblockedGamesQuery.isLoading}
                    noResultsMessage={
                        noUnblockedGames ? <span>{t(`resolve-blocker.no-unblocked-games`)}</span> : undefined
                    }
                    isUnblocked={true}
                />
            )}
        </Container>
    );
};

export default ResolveBlocker;
