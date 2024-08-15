import Explainer from 'pages/Overdrop/components/Explainer';
import LevelRecap from 'pages/Overdrop/components/LevelRecap';
import LevelUpModal from 'pages/Overdrop/components/LevelUpModal';
import React from 'react';
import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

const LevelingTree: React.FC = () => {
    return (
        <Wrapper>
            <Explainer />
            <LevelRecap />
            <LevelUpModal currentLevel={4} />
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivRow)`
    flex-basis: 200px;
    gap: 10px;
    align-items: flex-start;
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

export default LevelingTree;
