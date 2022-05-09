import Loader from 'components/Loader';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

const HomeLayout: React.FC = ({ children }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    return (
        <>
            {isAppReady ? (
                <Background>
                    <Wrapper>{children}</Wrapper>
                </Background>
            ) : (
                <Loader />
            )}
        </>
    );
};

const Background = styled.section`
    width: 100%;
    min-height: 100vh;
    background: ${(props) => props.theme.background.primary};
    font-size: 16px;
`;

const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    min-height: 100vh;
    margin: auto;
    max-width: 1220px;
    padding: 40px 20px;
    align-items: center;
`;

export default HomeLayout;
