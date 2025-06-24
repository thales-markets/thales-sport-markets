import { OverdropTab } from 'enums/ui';
import BadgeOverview from 'pages/Overdrop/components/BadgeOverview';
import DailyRecap from 'pages/Overdrop/components/DailyRecap';
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
            {/* <OverdropBanner /> */}
            <XPOverview setSelectedTab={setSelectedTab} />
            <LevelDetailsWrapper isMobile={isMobile}>
                <DailyRecap />
                <BadgeOverview />
            </LevelDetailsWrapper>
        </Wrapper>
    );
};

const LevelDetailsWrapper = styled(FlexDivRow)<{ isMobile: boolean }>`
    margin-top: ${(props) => (props.isMobile ? '16px' : '40px')};
    flex-direction: ${(props) => (props.isMobile ? 'column' : 'row')};
    gap: 10px;
    justify-content: center;
`;

const Wrapper = styled(FlexDivColumn)``;

export default OverdropHome;
