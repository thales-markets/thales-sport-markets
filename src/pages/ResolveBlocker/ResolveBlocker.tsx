import { t } from 'i18next';
import useBlockedGamesQuery from 'queries/resolveBlocker/useBlockedGamesQuery';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { BlockedGames } from 'types/resolveBlocker';
import BlockedGamesTable from './BlockedGamesTable';
import { Container, Title } from './styled-components';

const ResolveBlocker: React.FC = () => {
    const networkId = useSelector(getNetworkId);
    const isAppReady = useSelector(getIsAppReady);
    const [lastValidData, setLastValidData] = useState<BlockedGames>([]);

    const blockedGamesQuery = useBlockedGamesQuery(networkId, {
        enabled: isAppReady,
    });

    useEffect(() => {
        if (blockedGamesQuery.isSuccess && blockedGamesQuery.data) {
            setLastValidData(blockedGamesQuery.data);
        }
    }, [blockedGamesQuery]);

    const noBlockedGames = lastValidData.length === 0;

    return (
        <Container>
            <Title>{t('resolve-blocker.title')}</Title>
            <BlockedGamesTable
                blockedGames={lastValidData}
                isLoading={blockedGamesQuery.isLoading}
                noResultsMessage={noBlockedGames ? <span>{t(`resolve-blocker.no-blocked-games`)}</span> : undefined}
            />
        </Container>
    );
};

export default ResolveBlocker;
