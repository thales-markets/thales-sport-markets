import Loader from 'components/Loader';
import DappFooter from 'layouts/DappLayout/DappFooter';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

const LandingPageLayout: React.FC = ({ children }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    return (
        <>
            {isAppReady ? (
                <Background>
                    <Wrapper>
                        {children}
                        <DappFooter />
                    </Wrapper>
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
    background: ${(props) => props.theme.background.secondary};
    font-size: 16px;
`;

const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    min-height: 100vh;
    margin: auto;
    max-width: 1220px;
    padding: 30px 20px;
    align-items: center;
`;

export default LandingPageLayout;
