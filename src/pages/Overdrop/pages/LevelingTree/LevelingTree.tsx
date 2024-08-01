import Explainer from 'pages/Overdrop/components/Explainer';
import LevelRecap from 'pages/Overdrop/components/LevelRecap';
import React from 'react';
import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

const LevelingTree: React.FC = () => {
    return (
        <Wrapper>
            <Explainer />
            <LevelRecap />
        </Wrapper>
    );
};

const Wrapper = styled(FlexDivRow)`
    flex-basis: 200px;
    gap: 10px;
    align-items: flex-start;
`;

export default LevelingTree;
