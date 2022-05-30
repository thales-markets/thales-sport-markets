import Loader from 'components/Loader';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import soccer_pitch from 'assets/images/home-background-1.png';
import tennis from 'assets/images/home-background-2.png';
import soccer_ball from 'assets/images/home-background-3.png';
import track from 'assets/images/home-background-4.png';
import golf from 'assets/images/home-background-5.png';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import 'styles/coming-soon.css';
import { ReactComponent as SoccerPitchText } from 'assets/images/home-text-1.svg';
import { ReactComponent as TennisText } from 'assets/images/home-text-2.svg';
import { ReactComponent as SoccerBallText } from 'assets/images/home-text-3.svg';
import { ReactComponent as TrackText } from 'assets/images/home-text-4.svg';
import { ReactComponent as GolfText } from 'assets/images/home-text-5.svg';

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

    const images = useMemo(() => {
        return shuffle([
            {
                image: soccer_pitch,
                wrapperStyle: { justifyContent: 'flex-end' },
                textComponent: SoccerPitchText,
                className: 'soccer-pitch-text',
            },
            {
                image: tennis,
                wrapperStyle: { justifyContent: 'center' },
                textComponent: TennisText,
                className: 'tennis-text',
            },
            {
                image: soccer_ball,
                wrapperStyle: {},
                textComponent: SoccerBallText,
                className: 'soccer-ball-text',
            },
            {
                image: track,
                wrapperStyle: {},
                textComponent: TrackText,
                className: 'track-text',
            },
            {
                image: golf,
                wrapperStyle: {},
                textComponent: GolfText,
                className: 'golf-text',
            },
        ]);
    }, []);
    console.log('dsads');
    return (
        <>
            {isAppReady ? (
                <>
                    <div className="image-container">
                        {images.map((img, index) => {
                            return (
                                <Background key={index} image={img.image}>
                                    <Wrapper style={img.wrapperStyle}>
                                        {React.createElement(img.textComponent, { className: img.className })}
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
