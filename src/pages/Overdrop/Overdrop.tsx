import BannerCarousel from 'components/BannerCarousel';
import { OverdropTab } from 'enums/ui';
import UserStatsV2 from 'pages/Profile/components/UserStatsV2';
import React, { useState } from 'react';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import Navigation from './components/Navigation';
import LevelingTree from './pages/LevelingTree';
import OverdropHome from './pages/OverdropHome';
import XPDetails from './pages/XPDetails/XPDetails';

const Overdrop: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<OverdropTab>(OverdropTab.OVERDROP_HOME);

    return (
        <RowContainer>
            <LeftSidebarContainer>
                <BannerCarousel />
            </LeftSidebarContainer>
            <MainContainer>
                <Navigation selectedTab={selectedTab} setSelectedTab={(tab: OverdropTab) => setSelectedTab(tab)} />
                {selectedTab == OverdropTab.OVERDROP_HOME && <OverdropHome />}
                {selectedTab == OverdropTab.XP_CALCULATOR && <XPDetails />}
                {selectedTab == OverdropTab.LEVELING_TREE && <LevelingTree />}
            </MainContainer>
            <RightSidebarContainer>
                <UserStatsV2 />
            </RightSidebarContainer>
        </RowContainer>
    );
};

const RowContainer = styled(FlexDivRow)`
    width: 100%;
    flex: 1 1 0%;
    flex-direction: row;
    justify-content: center;
`;

const SidebarContainer = styled(FlexDivColumn)`
    flex-grow: 1;
    @media (max-width: 950px) {
        display: none;
    }
`;

const LeftSidebarContainer = styled(SidebarContainer)`
    width: 100%;
    max-width: 263px;
    @media (max-width: 1399px) {
        display: none;
    }
`;

const RightSidebarContainer = styled(SidebarContainer)`
    max-width: 360px;
    @media (max-width: 1399px) {
        max-width: 320px;
    }
`;

const MainContainer = styled(FlexDivColumn)`
    width: 100%;
    max-width: 806px;
    flex-grow: 1;
    margin: 0 25px;
    @media (max-width: 1499px) {
        margin: 0 12px;
    }
    @media (max-width: 1199px) {
        margin: 0 10px;
    }
    @media (max-width: 950px) {
        margin: 0;
        width: 100%;
    }
`;

export default Overdrop;
