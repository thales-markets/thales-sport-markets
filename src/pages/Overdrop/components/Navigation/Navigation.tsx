import { OverdropTab } from 'enums/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

type NavigationProps = {
    selectedTab: OverdropTab;
    setSelectedTab: (tab: OverdropTab) => void;
};

const Navigation: React.FC<NavigationProps> = ({ selectedTab, setSelectedTab }) => {
    const { t } = useTranslation();

    return (
        <Wrapper>
            <NavItem
                active={selectedTab === OverdropTab.OVERDROP_HOME}
                onClick={() => setSelectedTab(OverdropTab.OVERDROP_HOME)}
            >
                <NavIcon className="icon icon--controller" active={selectedTab === OverdropTab.OVERDROP_HOME} />
                {t('overdrop.navigation-menu.home')}
            </NavItem>
            <NavItem
                active={selectedTab === OverdropTab.XP_CALCULATOR}
                onClick={() => setSelectedTab(OverdropTab.XP_CALCULATOR)}
            >
                <NavIcon className="icon icon--calculator" active={selectedTab === OverdropTab.XP_CALCULATOR} />
                {t('overdrop.navigation-menu.xp-calculation')}
            </NavItem>
            <NavItem
                active={selectedTab === OverdropTab.LEVELING_TREE}
                onClick={() => setSelectedTab(OverdropTab.LEVELING_TREE)}
            >
                <NavIcon className="icon icon--book" active={selectedTab === OverdropTab.LEVELING_TREE} />
                {t('overdrop.navigation-menu.leveling-tree')}
            </NavItem>
            <NavItem
                active={selectedTab === OverdropTab.LEADERBOARD}
                onClick={() => setSelectedTab(OverdropTab.LEADERBOARD)}
            >
                <NavIcon className="icon icon--leaderboard" active={selectedTab === OverdropTab.LEADERBOARD} />
                {t('overdrop.navigation-menu.leaderboard')}
            </NavItem>
        </Wrapper>
    );
};

const Wrapper = styled(FlexDiv)`
    width: 100%;
    justify-content: space-between;
    margin-top: 15px;
    margin-bottom: 25px;
    align-items: center;
    @media (max-width: 575px) {
        margin-top: 10px;
        margin-bottom: 15px;
    }
`;

const NavItem = styled(FlexDiv)<{ active?: boolean }>`
    align-items: center;
    color: ${(props) => (props?.active ? props.theme.overdrop.textColor.primary : props.theme.textColor.primary)};
    font-size: 13px;
    font-weight: 600;
    text-align: left;
    text-transform: uppercase;
    padding-bottom: 10px;
    cursor: pointer;
`;

const NavIcon = styled.i<{ active?: boolean }>`
    color: ${(props) => (props?.active ? props.theme.overdrop.textColor.primary : props.theme.textColor.primary)};
    font-size: 17px;
    margin-right: 3px;
    font-weight: 300;
    text-transform: none !important;
`;

export default Navigation;
