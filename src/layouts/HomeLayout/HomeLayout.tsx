import Loader from 'components/Loader';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import soccer_pitch from 'assets/images/home-background-1.png';
import tennis from 'assets/images/home-background-2.png';
import soccer_ball from 'assets/images/home-background-3.png';
import track from 'assets/images/home-background-4.png';
import golf from 'assets/images/home-background-5.png';
import soccer_pitch_mobile from 'assets/images/home-background-1-mobile.png';
import tennis_mobile from 'assets/images/home-background-2-mobile.png';
import soccer_ball_mobile from 'assets/images/home-background-3-mobile.png';
import track_mobile from 'assets/images/home-background-4-mobile.png';
import golf_mobile from 'assets/images/home-background-5-mobile.png';
import styled from 'styled-components';
import { FlexDivColumn } from 'styles/common';
import 'styles/coming-soon.css';
import { ReactComponent as SoccerPitchText } from 'assets/images/home-text-1.svg';
import { ReactComponent as TennisText } from 'assets/images/home-text-2.svg';
import { ReactComponent as SoccerBallText } from 'assets/images/home-text-3.svg';
import { ReactComponent as TrackText } from 'assets/images/home-text-4.svg';
import { ReactComponent as GolfText } from 'assets/images/home-text-5.svg';
import { ReactComponent as SoccerPitchTextMobile } from 'assets/images/home-text-1-mobile.svg';
import { ReactComponent as TennisTextMobile } from 'assets/images/home-text-2-mobile.svg';
import { ReactComponent as SoccerBallTextMobile } from 'assets/images/home-text-3-mobile.svg';
import { ReactComponent as TrackTextMobile } from 'assets/images/home-text-4-mobile.svg';
import { ReactComponent as GolfTextMobile } from 'assets/images/home-text-5-mobile.svg';

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

const cacheImages = async (srcArray: string[], setIsLoading: (isLoading: boolean) => void) => {
    await Promise.all(
        srcArray.map((src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(true);
                img.onerror = () => resolve(true);
            });
        })
    );
    setIsLoading(false);
};

const HomeLayout: React.FC = () => {
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const [isLoading, setIsLoading] = useState(true);

    const images = useMemo(() => {
        return shuffle([
            {
                image: isMobile ? soccer_pitch_mobile : soccer_pitch,
                wrapperStyle: { justifyContent: 'flex-end' },
                textComponent: isMobile ? SoccerPitchTextMobile : SoccerPitchText,
                className: 'soccer-pitch-text',
            },
            {
                image: isMobile ? tennis_mobile : tennis,
                wrapperStyle: { justifyContent: 'center' },
                textComponent: isMobile ? TennisTextMobile : TennisText,
                className: 'tennis-text',
            },
            {
                image: isMobile ? soccer_ball_mobile : soccer_ball,
                wrapperStyle: {},
                textComponent: isMobile ? SoccerBallTextMobile : SoccerBallText,
                className: 'soccer-ball-text',
            },
            {
                image: isMobile ? track_mobile : track,
                wrapperStyle: {},
                textComponent: isMobile ? TrackTextMobile : TrackText,
                className: 'track-text',
            },
            {
                image: isMobile ? golf_mobile : golf,
                wrapperStyle: {},
                textComponent: isMobile ? GolfTextMobile : GolfText,
                className: 'golf-text',
            },
        ]);
    }, []);

    useEffect(() => {
        cacheImages(
            images.map((image) => image.image),
            setIsLoading
        );
    }, [images]);

    return (
        <>
            {isAppReady && !isLoading ? (
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
    background-position: center center;
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
