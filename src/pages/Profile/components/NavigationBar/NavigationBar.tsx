import useClaimablePositionCountV2Query from 'queries/markets/useClaimablePositionCountV2Query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Count, Icon, Item, ItemWrapper, NotificationCount, Wrapper } from './styled-components';

export const navItems = [
    {
        id: 1,
        i18Label: 'profile.open-claimable',
        icon: 'icon icon--ticket-horizontal',
    },
    {
        id: 2,
        i18Label: 'profile.transaction-history',
        icon: 'icon icon--history',
    },
    {
        id: 3,
        i18Label: 'profile.lp',
        icon: 'icon icon--yield',
    },
];

type NavigationBarProps = {
    itemSelected: number;
    onSelectItem: (index: number) => void;
};

const NavigationBar: React.FC<NavigationBarProps> = ({ itemSelected, onSelectItem }) => {
    const { t } = useTranslation();

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const claimablePositionsCountQuery = useClaimablePositionCountV2Query(walletAddress, networkId, {
        enabled: isWalletConnected,
    });
    const claimablePositionCount =
        claimablePositionsCountQuery.isSuccess && claimablePositionsCountQuery.data
            ? claimablePositionsCountQuery.data
            : null;

    return (
        <Wrapper>
            {navItems.map((item, index) => {
                const notificationsCount = item.id === 1 ? claimablePositionCount : 0;
                return (
                    <ItemWrapper key={index}>
                        <Item key={index} selected={item.id == itemSelected} onClick={() => onSelectItem(item.id)}>
                            <Icon className={item.icon} />
                            {t(item.i18Label)}
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

export default NavigationBar;
