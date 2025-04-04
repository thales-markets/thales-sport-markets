import Tooltip from 'components/Tooltip';
import { ProfileTab } from 'enums/ui';
import usePositionCountV2Query from 'queries/markets/usePositionCountV2Query';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { RootState } from 'types/redux';
import useBiconomy from 'utils/useBiconomy';
import { useAccount, useChainId, useClient } from 'wagmi';
import {
    ClaimableTicketsNotificationCount,
    Count,
    Icon,
    Item,
    ItemLabel,
    ItemWrapper,
    OpenTicketsNotificationCount,
    Wrapper,
} from './styled-components';

const navItems = [
    {
        id: ProfileTab.ACCOUNT,
        i18Label: 'profile.account',
        icon: 'icon icon--logo',
    },
    {
        id: ProfileTab.OPEN_CLAIMABLE,
        i18Label: 'profile.open-claimable',
        icon: 'icon icon--ticket-horizontal',
    },
    {
        id: ProfileTab.TRANSACTION_HISTORY,
        i18Label: 'profile.transaction-history',
        icon: 'icon icon--history',
    },
    {
        id: ProfileTab.LP,
        i18Label: 'profile.lp',
        icon: 'icon icon--yield',
    },
];

type NavigationBarProps = {
    selectedTab: ProfileTab;
    setSelectedTab: (tab: ProfileTab) => void;
};

const NavigationBar: React.FC<NavigationBarProps> = ({ selectedTab, setSelectedTab }) => {
    const { t } = useTranslation();

    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const smartAddres = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddres : address) || '';

    const positionsCountQuery = usePositionCountV2Query(walletAddress, { networkId, client }, { enabled: isConnected });

    const claimablePositionCount = useMemo(
        () => (positionsCountQuery.isSuccess && positionsCountQuery.data ? positionsCountQuery.data.claimable : 0),
        [positionsCountQuery.isSuccess, positionsCountQuery.data]
    );
    const openPositionCount = useMemo(
        () => (positionsCountQuery.isSuccess && positionsCountQuery.data ? positionsCountQuery.data.open : 0),
        [positionsCountQuery.isSuccess, positionsCountQuery.data]
    );

    return (
        <Wrapper>
            {navItems.map((item, index) => {
                const hasClaimableNotification =
                    item.id === ProfileTab.OPEN_CLAIMABLE ? claimablePositionCount > 0 : false;
                const hasOpenNotification = item.id === ProfileTab.OPEN_CLAIMABLE ? openPositionCount > 0 : false;
                return (
                    <ItemWrapper key={index} onClick={() => setSelectedTab(item.id)}>
                        <Item selected={item.id == selectedTab}>
                            <Icon className={item.icon} />
                            {hasClaimableNotification && (
                                <Tooltip open={true} overlay={t('profile.categories.claimable')}>
                                    <ClaimableTicketsNotificationCount>
                                        <Count>{claimablePositionCount}</Count>
                                    </ClaimableTicketsNotificationCount>
                                </Tooltip>
                            )}
                            {hasOpenNotification && (
                                <Tooltip open={true} overlay={t('profile.categories.open')}>
                                    <OpenTicketsNotificationCount>
                                        <Count>{openPositionCount}</Count>
                                    </OpenTicketsNotificationCount>
                                </Tooltip>
                            )}
                        </Item>
                        <ItemLabel selected={item.id == selectedTab}>{t(item.i18Label)}</ItemLabel>
                    </ItemWrapper>
                );
            })}
        </Wrapper>
    );
};

export default NavigationBar;
