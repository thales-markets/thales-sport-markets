import { PnlTab } from 'enums/ui';
import React from 'react';
import { Icon, Item, ItemWrapper, Wrapper } from './styled-components';

const navItems = [
    {
        id: PnlTab.LP_STATS,
        label: 'LP Stats',
        icon: 'icon icon--yield',
    },
    {
        id: PnlTab.USDC_USER_PNL,
        label: 'USDC',
        icon: 'currency-icon currency-icon--usdc',
    },
    {
        id: PnlTab.WETH_USER_PNL,
        label: 'WETH',
        icon: 'currency-icon currency-icon--weth',
    },
    {
        id: PnlTab.THALES_USER_PNL,
        label: 'THALES',
        icon: 'currency-icon currency-icon--thales',
    },
    {
        id: PnlTab.USDC_TICKETS,
        label: 'USDC TICKETS',
        icon: 'currency-icon currency-icon--usdc',
    },
    {
        id: PnlTab.WETH_TICKETS,
        label: 'WETH TICKETS',
        icon: 'currency-icon currency-icon--weth',
    },
    {
        id: PnlTab.THALES_TICKETS,
        label: 'THALES TICKETS',
        icon: 'currency-icon currency-icon--thales',
    },
];

type NavigationBarProps = {
    selectedTab: PnlTab;
    setSelectedTab: (tab: PnlTab) => void;
};

const NavigationBar: React.FC<NavigationBarProps> = ({ selectedTab, setSelectedTab }) => {
    return (
        <Wrapper>
            {navItems.map((item, index) => {
                return (
                    <ItemWrapper key={index}>
                        <Item key={index} selected={item.id == selectedTab} onClick={() => setSelectedTab(item.id)}>
                            <Icon className={item.icon} />
                            {item.label}
                        </Item>
                    </ItemWrapper>
                );
            })}
        </Wrapper>
    );
};

export default NavigationBar;
