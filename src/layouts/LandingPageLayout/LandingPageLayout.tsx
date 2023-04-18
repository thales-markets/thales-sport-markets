import Loader from 'components/Loader';
import DappFooter from 'layouts/DappLayout/DappFooter';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import { setTheme } from 'redux/modules/ui';
import { Theme } from 'constants/ui';
import ROUTES from 'constants/routes';

const LandingPageLayout: React.FC = ({ children }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname !== ROUTES.MintWorldCupNFT) {
            dispatch(setTheme(Theme.DARK));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

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
    padding: 40px 20px;
    align-items: center;
`;

export default LandingPageLayout;
