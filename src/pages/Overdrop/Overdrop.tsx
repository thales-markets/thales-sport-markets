import BannerCarousel from 'components/BannerCarousel';
import UserStatsV2 from 'pages/Profile/components/UserStatsV2';
import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import BadgeOverview from './components/BadgeOverview';
import DailyRecap from './components/DailyRecap';
import XPOverview from './components/XPOverview';

const Overdrop: React.FC = () => {
    return (
        <RowContainer>
            <LeftSidebarContainer>
                <BannerCarousel />
            </LeftSidebarContainer>
            <MainContainer>
                <XPOverview />
                <LevelDetailsWrapper>
                    <DailyRecap />
                    <BadgeOverview />
                </LevelDetailsWrapper>
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

const LevelDetailsWrapper = styled(FlexDivRow)`
    margin-top: 40px;
    flex: 1 1 20%;
    gap: 10px;
    max-height: 320px;
    align-items: flex-start;
`;

export default Overdrop;
