import useClaimablePositionCountV2Query from 'queries/markets/useClaimablePositionCountV2Query';
import useOvertimeVoucherEscrowQuery from 'queries/wallet/useOvertimeVoucherEscrowQuery';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { Count, Item, ItemWrapper, NotificationCount, Wrapper } from './styled-components';

export const navItems = [
    {
        id: 1,
        i18Label: 'profile.open-claimable',
    },
    {
        id: 2,
        i18Label: 'profile.transaction-history',
    },
    {
        id: 3,
        i18Label: 'profile.lp',
    },
    // {
    //     id: 4,
    //     i18Label: 'profile.voucher',
    // },
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

    const overtimeVoucherEscrowQuery = useOvertimeVoucherEscrowQuery(walletAddress, networkId, {
        enabled: isWalletConnected,
    });
    const overtimeVoucherEscrowData = overtimeVoucherEscrowQuery.isSuccess ? overtimeVoucherEscrowQuery.data : null;
    const vouchersCount = overtimeVoucherEscrowData?.isClaimable ? 1 : 0;

    return (
        <Wrapper>
            {navItems.map((item, index) => {
                const notificationsCount = item.id === 1 ? claimablePositionCount : item.id === 4 ? vouchersCount : 0;
                return (
                    <ItemWrapper key={index}>
                        <Item key={index} selected={item.id == itemSelected} onClick={() => onSelectItem(item.id)}>
                            {t(item.i18Label).replace('/', '/\u200B')}
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
