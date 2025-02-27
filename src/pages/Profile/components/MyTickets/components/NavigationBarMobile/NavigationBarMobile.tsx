import { ProfileTab } from 'enums/ui';
import useClaimablePositionCountV2Query from 'queries/markets/useClaimablePositionCountV2Query';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsBiconomy } from 'redux/modules/wallet';
import { RootState } from 'types/redux';
import biconomyConnector from 'utils/biconomyWallet';
import { useAccount, useChainId, useClient } from 'wagmi';
import { Count, Icon, Item, ItemWrapper, NotificationCount, Wrapper } from './styled-components';

const navItems = [
    {
        id: ProfileTab.STATS,
        icon: 'icon icon--logo',
    },
    {
        id: ProfileTab.ACCOUNT,
        icon: 'icon icon--wallet2',
    },
    {
        id: ProfileTab.OPEN_CLAIMABLE,
        icon: 'icon icon--ticket-horizontal',
    },
    {
        id: ProfileTab.TRANSACTION_HISTORY,
        icon: 'icon icon--history',
    },
    {
        id: ProfileTab.LP,
        icon: 'icon icon--yield',
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
    const walletAddress = (isBiconomy ? biconomyConnector.address : address) || '';

    const claimablePositionsCountQuery = useClaimablePositionCountV2Query(
        walletAddress,
        { networkId, client },
        {
            enabled: isConnected,
        }
    );
    const claimablePositionCount =
        claimablePositionsCountQuery.isSuccess && claimablePositionsCountQuery.data
            ? claimablePositionsCountQuery.data
            : null;

    return (
        <Wrapper>
            {navItems.map((item, index) => {
                const notificationsCount = item.id === ProfileTab.OPEN_CLAIMABLE ? claimablePositionCount : 0;
                return (
                    <ItemWrapper key={index}>
                        <Item key={index} onClick={() => setSelectedTab(item.id)}>
                            <Icon selected={item.id == selectedTab} className={item.icon} />
                        </Item>
                        {!!notificationsCount && (
                            <NotificationCount key={'count' + index}>
                                <Count>{notificationsCount}</Count>
                            </NotificationCount>
                        )}
                    </ItemWrapper>
                );
            })}
        </Wrapper>
    );
};

export default NavigationBarMobile;
