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

const shuffle = (array: any[]) => {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
};

const HomeLayout: React.FC = () => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));

    const images = [
        {
            image: uno,
            wrapperStyle: { justifyContent: 'flex-end' },
            textComponent: HomeText1,
            textStyle: { height: '80vh', width: '100vw' },
        },
        {
            image: dos,
            wrapperStyle: { justifyContent: 'center' },
            textComponent: HomeText2,
            textStyle: {},
        },
        {
            image: tres,
            wrapperStyle: {},
            textComponent: HomeText3,
            textStyle: { padding: '50px', height: '100vh', width: '100vw' },
        },
    ];

    return (
        <>
            {isAppReady ? (
                <>
                    <div className="image-container">
                        {shuffle(images).map((img, index) => {
                            return (
                                <Background key={index} image={img.image}>
                                    <Wrapper style={img.wrapperStyle}>
                                        {React.createElement(img.textComponent, { style: img.textStyle })}
                                    </Wrapper>
                                </Background>
                            );
                        })}
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
