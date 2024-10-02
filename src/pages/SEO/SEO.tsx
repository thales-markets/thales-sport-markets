import React from 'react';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import Articles from './components/Articles';

const SEO: React.FC = () => {
    return (
        <Background>
            <Wrapper>
                <Articles />
            </Wrapper>
        </Background>
    );
};

const Background = styled.section`
    min-height: 100vh;
    background: ${(props) => props.theme.background.primary};
    color: ${(props) => props.theme.textColor.primary};
    position: relative;
`;

const Wrapper = styled(FlexDivColumn)`
    align-items: center;
    width: 99%;
    margin-left: auto;
    margin-right: auto;
    padding: 10px 15px;
    max-width: 1512px;
    min-height: 100vh;
    justify-content: space-between;
    @media (max-width: 1499px) {
        padding: 10px 10px;
    }
    @media (max-width: 767px) {
        padding: 0px 3px;
    }
`;

export default SEO;
