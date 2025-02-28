import { PnlTab } from 'enums/ui';
import React from 'react';
import { NetworkId } from 'thales-utils';
import { useChainId } from 'wagmi';
import { Icon, Item, ItemWrapper, Wrapper } from './styled-components';

const navItems = [
    {
        id: PnlTab.LP_STATS,
        label: 'LP STATS',
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
        id: PnlTab.CBBTC_USERS_PNL,
        label: 'cbBTC',
        icon: 'currency-icon currency-icon--cbbtc',
    },
    {
        id: PnlTab.WBTC_USERS_PNL,
        label: 'wBTC',
        icon: 'currency-icon currency-icon--wbtc',
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
    const networkId = useChainId();

    return (
        <Wrapper>
            {navItems
                .filter(
                    (item) =>
                        (networkId === NetworkId.Base &&
                            item.id !== PnlTab.THALES_USERS_PNL &&
                            item.id !== PnlTab.WBTC_USERS_PNL) ||
                        (networkId === NetworkId.Arbitrum && item.id !== PnlTab.CBBTC_USERS_PNL) ||
                        (networkId === NetworkId.OptimismMainnet &&
                            item.id !== PnlTab.CBBTC_USERS_PNL &&
                            item.id !== PnlTab.WBTC_USERS_PNL)
                )
                .map((item, index) => {
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
