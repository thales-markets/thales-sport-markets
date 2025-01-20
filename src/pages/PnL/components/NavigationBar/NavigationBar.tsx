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
        id: PnlTab.USDC_USERS_PNL,
        label: 'USDC',
        icon: 'currency-icon currency-icon--usdc',
    },
    {
        id: PnlTab.WETH_USERS_PNL,
        label: 'WETH',
        icon: 'currency-icon currency-icon--weth',
    },
    {
        id: PnlTab.THALES_USERS_PNL,
        label: 'THALES',
        icon: 'currency-icon currency-icon--thales',
    },
    {
        id: PnlTab.OVER_USERS_PNL,
        label: 'OVER',
        icon: 'currency-icon currency-icon--over',
    },
    // {
    //     id: PnlTab.USDC_TICKETS,
    //     label: 'USDC TICKETS',
    //     icon: 'currency-icon currency-icon--usdc',
    // },
    // {
    //     id: PnlTab.WETH_TICKETS,
    //     label: 'WETH TICKETS',
    //     icon: 'currency-icon currency-icon--weth',
    // },
    // {
    //     id: PnlTab.THALES_TICKETS,
    //     label: 'THALES TICKETS',
    //     icon: 'currency-icon currency-icon--thales',
    // },
    {
        id: PnlTab.TICKETS,
        label: 'TICKETS',
        icon: 'icon icon--ticket-horizontal',
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
