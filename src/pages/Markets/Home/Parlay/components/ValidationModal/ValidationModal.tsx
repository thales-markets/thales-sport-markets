import checkmarkAnimationData from 'assets/lotties/green-checkmark.json';
import crossmarkAnimationData from 'assets/lotties/red-checkmark.json';
import Modal from 'components/Modal';
import { ParlayErrorCode } from 'constants/markets';
import useInterval from 'hooks/useInterval';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import React, { createRef, CSSProperties, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getParlayError, resetParlayError, getParlaySize } from 'redux/modules/parlay';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';

type ValidationModalProps = {
    onClose: () => void;
};

const DELAY_ANIMATION_PLAY = 200;
const ANIMATION_TIME = 1200;

export const ValidationModal: React.FC<ValidationModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const parlayError = useSelector(getParlayError);
    const parlaySize = useSelector(getParlaySize);

    const lottiesRef = useRef([...Array(parlaySize + 1)].map(() => createRef<LottieRefCurrentProps>()));

    const crossmarkStart = parlaySize * DELAY_ANIMATION_PLAY;
    const crossmarkEnd = crossmarkStart + ANIMATION_TIME;

    useInterval(async () => {
        dispatch(resetParlayError());
    }, crossmarkEnd);

    const getMaxMatchesAnimation = () => {
        // crossmark play
        setTimeout(() => lottiesRef.current[parlaySize]?.current?.play(), crossmarkStart);
        // crossmark pause
        setTimeout(() => lottiesRef.current[parlaySize]?.current?.pause(), crossmarkEnd);

        return (
            <Animation>
                {[...Array(parlaySize)].map((_elem, index) => {
                    const checkmarkStart = index * DELAY_ANIMATION_PLAY;
                    const checkmarkEnd = checkmarkStart + ANIMATION_TIME;
                    // checkmark play
                    setTimeout(() => lottiesRef.current[index]?.current?.play(), checkmarkStart);
                    // checkmark pause
                    setTimeout(() => lottiesRef.current[index]?.current?.pause(), checkmarkEnd);

                    return (
                        <Lottie
                            key={index}
                            autoplay={false}
                            animationData={checkmarkAnimationData}
                            style={checkmarkStyle}
                            lottieRef={lottiesRef.current[index]}
                        />
                    );
                })}
                <Lottie
                    autoplay={false}
                    animationData={crossmarkAnimationData}
                    style={checkmarkStyle}
                    lottieRef={lottiesRef.current[parlaySize]}
                />
            </Animation>
        );
    };

    return (
        <Modal title={t('markets.parlay.validation.title')} onClose={() => onClose()} shouldCloseOnOverlayClick={true}>
            <Container>
                {parlayError.code === ParlayErrorCode.MAX_MATCHES && (
                    <>
                        <ErrorMessage color={'#72c69b'}>
                            {t('markets.parlay.validation.max-teams', { max: parlayError.data })}
                        </ErrorMessage>
                        {getMaxMatchesAnimation()}
                    </>
                )}
                {parlayError.code === ParlayErrorCode.SAME_TEAM_TWICE && (
                    <ErrorMessage>
                        {t('markets.parlay.validation.team-in-parlay', { team: parlayError.data })}
                    </ErrorMessage>
                )}
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 400px;
    margin-top: 20px;
    align-items: center;
    @media (max-width: 575px) {
        width: auto;
    }
`;

const ErrorMessage = styled.p<{ color?: string }>`
    margin-top: 20px;
    font-style: normal;
    font-size: 15px;
    line-height: 22px;
    color: ${(props) => (props.color ? props.color : '#ffffff')};
    text-transform: uppercase;
`;

const Animation = styled(FlexDivRowCentered)``;

const checkmarkStyle: CSSProperties = {
    width: 50,
    margin: '0 -5px',
};

export default React.memo(ValidationModal);
