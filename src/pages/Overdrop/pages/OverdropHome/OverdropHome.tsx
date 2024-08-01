import BadgeOverview from 'pages/Overdrop/components/BadgeOverview';
import DailyRecap from 'pages/Overdrop/components/DailyRecap';
import XPOverview from 'pages/Overdrop/components/XPOverview';
import React from 'react';
import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

const OverdropHome: React.FC = () => {
    return (
        <>
            <XPOverview />
            <LevelDetailsWrapper>
                <DailyRecap />
                <BadgeOverview />
            </LevelDetailsWrapper>
        </>
    );
};

const LevelDetailsWrapper = styled(FlexDivRow)`
    margin-top: 40px;
    flex: 1 1 20%;
    gap: 10px;
    max-height: 320px;
    align-items: flex-start;
`;

export default OverdropHome;
