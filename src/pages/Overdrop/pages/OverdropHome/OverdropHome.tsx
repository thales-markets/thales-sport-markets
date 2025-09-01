import { OverdropTab } from 'enums/ui';
import BadgeHistory from 'pages/Overdrop/components/BadgeHistory';
import BadgeOverview from 'pages/Overdrop/components/BadgeOverview';
import DailyQuest from 'pages/Overdrop/components/DailyQuest';
import DailyRecap from 'pages/Overdrop/components/DailyRecap';
import EstimateRewards from 'pages/Overdrop/components/EstimateRewards';
import XPOverview from 'pages/Overdrop/components/XPOverview';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { RootState } from 'types/redux';

type OverdropHomeProps = {
    setSelectedTab: (tab: OverdropTab) => void;
};

const OverdropHome: React.FC<OverdropHomeProps> = ({ setSelectedTab }) => {
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <Wrapper>
            <DailyQuest />
            <XPOverview setSelectedTab={setSelectedTab} />
            <LevelDetailsWrapper isMobile={isMobile}>
                <BadgeOverview />
                <EstimateRewards />
                <DailyRecap />
            </LevelDetailsWrapper>
            <BadgeHistory />
        </Wrapper>
    );
};

const LevelDetailsWrapper = styled(FlexDivRow)<{ isMobile: boolean }>`
    margin-top: ${(props) => (props.isMobile ? '16px' : '20px')};
    flex-direction: column;
    gap: 10px;
    justify-content: center;
`;

const Wrapper = styled(FlexDivColumn)``;

export default OverdropHome;
