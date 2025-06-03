import { ProfileTab } from 'enums/ui';
import usePositionCountV2Query from 'queries/markets/usePositionCountV2Query';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { RootState } from 'types/redux';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
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
        id: ProfileTab.STATS,
        icon: 'icon icon--profile3',
        name: 'Info',
    },
    {
        id: ProfileTab.ACCOUNT,
        icon: 'icon icon--logo',
        name: 'Account',
    },

    {
        id: ProfileTab.OPEN_CLAIMABLE,
        icon: 'icon icon--ticket-horizontal',
        name: 'Tickets',
    },
    {
        id: ProfileTab.TRANSACTION_HISTORY,
        icon: 'icon icon--history',
        name: 'History',
    },
    {
        id: ProfileTab.LP,
        icon: 'icon icon--yield',
        name: 'LP',
    },
];

type NavigationBarProps = {
    selectedTab: ProfileTab;
    setSelectedTab: (tab: ProfileTab) => void;
};

const NavigationBarMobile: React.FC<NavigationBarProps> = ({ selectedTab, setSelectedTab }) => {
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const networkId = useChainId();
    const client = useClient();
    const { address, isConnected } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

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
                if (
                    !isConnected &&
                    (item.id === ProfileTab.ACCOUNT || item.id === ProfileTab.LP || item.id === ProfileTab.STATS)
                )
                    return;
                const hasClaimableNotification =
                    item.id === ProfileTab.OPEN_CLAIMABLE ? claimablePositionCount > 0 : false;
                const hasOpenNotification = item.id === ProfileTab.OPEN_CLAIMABLE ? openPositionCount > 0 : false;
                return (
                    <ItemWrapper key={index}>
                        <Item onClick={() => setSelectedTab(item.id)}>
                            <Icon selected={item.id == selectedTab} className={item.icon} />
                        </Item>
                        {hasClaimableNotification && (
                            <ClaimableTicketsNotificationCount>
                                <Count>{claimablePositionCount}</Count>
                            </ClaimableTicketsNotificationCount>
                        )}
                        {hasOpenNotification && (
                            <OpenTicketsNotificationCount>
                                <Count>{openPositionCount}</Count>
                            </OpenTicketsNotificationCount>
                        )}
                        <ItemLabel selected={item.id == selectedTab}>{item.name}</ItemLabel>
                    </ItemWrapper>
                );
            })}
        </Wrapper>
    );
};

export default NavigationBarMobile;
