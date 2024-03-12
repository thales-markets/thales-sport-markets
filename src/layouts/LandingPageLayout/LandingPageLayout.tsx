import Loader from 'components/Loader';
import { Theme } from 'enums/ui';
import DappFooter from 'layouts/DappLayout/DappFooter';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { setTheme } from 'redux/modules/ui';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';

const LandingPageLayout: React.FC = ({ children }) => {
    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    useEffect(() => {
        dispatch(setTheme(Theme.DARK));
    }, [dispatch]);

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
