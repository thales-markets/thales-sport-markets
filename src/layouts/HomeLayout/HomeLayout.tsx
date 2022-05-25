import Loader from 'components/Loader';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import uno from 'assets/images/home-background-1.png';
import dos from 'assets/images/home-background-2.png';
import tres from 'assets/images/home-background-3.png';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import 'styles/coming-soon.css';
import { ReactComponent as HomeText1 } from 'assets/images/home-text-1.svg';
import { ReactComponent as HomeText2 } from 'assets/images/home-text-2.svg';
import { ReactComponent as HomeText3 } from 'assets/images/home-text-3.svg';

const HomeLayout: React.FC = ({ children }) => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    console.log(children);
    return (
        <>
            {isAppReady ? (
                <>
                    <div className="image-container">
                        <Background image={uno}>
                            <Wrapper style={{ justifyContent: 'flex-end' }}>
                                <HomeText1 style={{ height: '80vh', width: '100vw' }} />
                            </Wrapper>
                        </Background>
                        <Background image={dos}>
                            <Wrapper style={{ justifyContent: 'center' }}>
                                <HomeText2 />
                            </Wrapper>
                        </Background>
                        <Background image={tres}>
                            <Wrapper>
                                <HomeText3 style={{ padding: '50px', height: '100vh', width: '100vw' }} />
                            </Wrapper>
                        </Background>
                    </div>
                </>
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
    background-size: cover;
    font-size: 16px;
`;

const Wrapper = styled(FlexDivColumn)`
    width: 100%;
    min-height: 100vh;
    margin: auto;
    max-width: 1220px;
    align-items: center;
    @media (max-width: 991px) {
        justify-content: center !important;
        svg {
            width: 100%;
            height: 100%;
        }
    }
`;

export default HomeLayout;
