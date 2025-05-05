import { LpStatsTab } from 'enums/ui';
import React from 'react';
import { Item, ItemWrapper, Wrapper } from './styled-components';

const navItems = [
    {
        id: LpStatsTab.BY_LP,
        label: 'BY LP',
    },
    {
        id: LpStatsTab.BY_TYPE,
        label: 'BY TYPE',
    },
    {
        id: LpStatsTab.BY_LEAGUE,
        label: 'BY LEAGUE (SINGLES)',
    },
];

type LpStatsNavigationProps = {
    selectedTab: LpStatsTab;
    setSelectedTab: (tab: LpStatsTab) => void;
};

const LpStatsNavigation: React.FC<LpStatsNavigationProps> = ({ selectedTab, setSelectedTab }) => {
    return (
        <Wrapper>
            {navItems.map((item, index) => {
                return (
                    <ItemWrapper key={index}>
                        <Item key={index} selected={item.id == selectedTab} onClick={() => setSelectedTab(item.id)}>
                            {item.label}
                        </Item>
                    </ItemWrapper>
                );
            })}
        </Wrapper>
    );
};

export default LpStatsNavigation;
