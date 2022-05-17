import Loader from 'components/Loader';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import BackgroundImage from 'assets/images/background.svg';

const HomeLayout: React.FC = ({ children }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    return (
        <>
            {isAppReady ? (
                <Background image={BackgroundImage}>
                    <Wrapper>{children}</Wrapper>
                </Background>
            ) : (
                <Loader />
            )}
        </>
    );
};

const Background = styled.section<{ image: string }>`
    width: 100%;
    min-height: 100vh;
    background-image: ${(props) => `url(${props.image})`};
    background-size: 100% 100%;
    font-size: 16px;
`;

const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    min-height: 100vh;
    margin: auto;
    max-width: 1220px;
    align-items: center;
`;

export default HomeLayout;
