import Button from 'components/Button';
import Checkbox from 'components/fields/Checkbox';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ResolveBlockerTab } from 'enums/resolveBlocker';
import { t } from 'i18next';
import useBlockedGamesQuery from 'queries/resolveBlocker/useBlockedGamesQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from 'styled-components';
import { BlockedGame, BlockedGames, SelectedBlockedGames } from 'types/resolveBlocker';
import { ThemeInterface } from 'types/ui';
import { refetchResolveBlocker } from 'utils/queryConnector';
import { Client } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useChainId, useClient, useWalletClient } from 'wagmi';
import { ContractType } from '../../enums/contract';
import { getContractInstance } from '../../utils/contract';
import BlockedGamesTable from './BlockedGamesTable';
import { CheckboxContainer, Container, HeadeContainer, Tab, TabContainer } from './styled-components';

const ResolveBlocker: React.FC = () => {
    const networkId = useChainId();
    const client = useClient();
    const walletClient = useWalletClient();

    const theme: ThemeInterface = useTheme();
    const [lastValidBlockedGames, setLastValidBlockedGames] = useState<BlockedGames>([]);
    const [lastValidUnblockedGames, setLastValidUnblockedGames] = useState<BlockedGames>([]);
    const [selectedTab, setSelectedTab] = useState<ResolveBlockerTab>(ResolveBlockerTab.BLOCKED_GAMES);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [numberOfSelectedGames, setNumberOfSelectedGames] = useState<number>(0);
    const [isUnblocking, setIsUnblocking] = useState<boolean>(false);
    const [selectedGames, setSelectedGames] = useState<SelectedBlockedGames>({});

    const blockedGamesQuery = useBlockedGamesQuery(false, { networkId, client });
    useEffect(() => {
        if (blockedGamesQuery.isSuccess && blockedGamesQuery.data) {
            setLastValidBlockedGames(blockedGamesQuery.data);
        }
    }, [blockedGamesQuery]);

    const unblockedGamesQuery = useBlockedGamesQuery(true, { networkId, client });
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

    useEffect(() => {
        setNumberOfSelectedGames(Object.values(selectedGames).filter((game) => game).length);
    }, [selectedGames, setNumberOfSelectedGames]);

    useEffect(() => {
        const newSelectedGames: any = {};
        lastValidBlockedGames.forEach((game: BlockedGame) => {
            newSelectedGames[game.gameId] = selectAll;
        });
        setSelectedGames(newSelectedGames);
    }, [lastValidBlockedGames, selectAll]);

    const updateSelectedGames = (gameId: string) => {
        {
            const newSelectedGames = { ...selectedGames };
            newSelectedGames[gameId] = !selectedGames[gameId] || false;
            setSelectedGames(newSelectedGames);
        }
    };

    const handleUnblock = async () => {
        const resolveBlockerContractWithSigner = getContractInstance(ContractType.RESOLVE_BLOCKER, {
            client: walletClient.data,
            networkId,
        });

        if (resolveBlockerContractWithSigner) {
            const toastId = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                setIsUnblocking(true);

                const gamesForUnblock: string[] = [];
                Object.keys(selectedGames).forEach((key: string) => {
                    if (selectedGames[key]) {
                        gamesForUnblock.push(key);
                    }
                });
                const txHash = await resolveBlockerContractWithSigner.write.unblockGames([gamesForUnblock]);
                const txReceipt = await waitForTransactionReceipt(client as Client, {
                    hash: txHash,
                });

                if (txReceipt.status === 'success') {
                    {
                        toast.update(
                            toastId,
                            getSuccessToastOptions(t('resolve-blocker.unblock-batch-confirmation-message'))
                        );
                        setIsUnblocking(false);
                        refetchResolveBlocker(networkId);
                    }
                }
            } catch (e) {
                toast.update(toastId, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                setIsUnblocking(false);
            }
        }
    };

    return (
        <Container>
            <HeadeContainer>
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
                    <CheckboxContainer>
                        <Checkbox
                            checked={selectAll}
                            value={selectAll.toString()}
                            onChange={(e: any) => setSelectAll(e.target.checked || false)}
                            label={t(`resolve-blocker.select-all`)}
                        />
                        <Button
                            onClick={handleUnblock}
                            backgroundColor={theme.button.background.quaternary}
                            borderColor={theme.button.borderColor.secondary}
                            height="24px"
                            fontSize="12px"
                            padding="4px 20px"
                            fontWeight="800"
                            margin="-2px 0px 0px 20px"
                            disabled={!numberOfSelectedGames || isUnblocking}
                        >
                            {`${t(`resolve-blocker.unblock-selected`)}${
                                !numberOfSelectedGames ? '' : ` (${numberOfSelectedGames})`
                            }`}
                        </Button>
                    </CheckboxContainer>
                )}
            </HeadeContainer>
            {selectedTab === ResolveBlockerTab.BLOCKED_GAMES && (
                <BlockedGamesTable
                    blockedGames={lastValidBlockedGames}
                    isLoading={blockedGamesQuery.isLoading}
                    noResultsMessage={noBlockedGames ? <span>{t(`resolve-blocker.no-blocked-games`)}</span> : undefined}
                    isUnblocked={false}
                    selectedGames={selectedGames}
                    updateSelectedGames={updateSelectedGames}
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
                    selectedGames={selectedGames}
                    updateSelectedGames={updateSelectedGames}
                />
            )}
        </Container>
    );
};

export default ResolveBlocker;
