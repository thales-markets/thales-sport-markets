import Modal from 'components/Modal';
import { TicketErrorCode } from 'enums/markets';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getTicketError } from 'redux/modules/ticket';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';

type ValidationModalProps = {
    onClose: () => void;
};

// const DELAY_ANIMATION_PLAY = 200;
// const ANIMATION_TIME = 1200;

const ValidationModal: React.FC<ValidationModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    // const dispatch = useDispatch();

    const ticketError = useSelector(getTicketError);
    // const maxTicketSize = useSelector(getMaxTicketSize);

    // const lottiesRef = useRef([...Array(maxTicketSize + 1)].map(() => createRef<LottieRefCurrentProps>()));

    // const crossmarkStart = maxTicketSize * DELAY_ANIMATION_PLAY;
    // const crossmarkEnd = crossmarkStart + ANIMATION_TIME;

    // useInterval(async () => {
    //     dispatch(resetTicketError());
    // }, crossmarkEnd);

    // const getMaxMatchesAnimation = () => {
    //     // crossmark play
    //     setTimeout(() => lottiesRef.current[maxTicketSize]?.current?.play(), crossmarkStart);
    //     // crossmark pause
    //     setTimeout(() => lottiesRef.current[maxTicketSize]?.current?.pause(), crossmarkEnd);

    //     return (
    //         <Animation>
    //             {[...Array(maxTicketSize)].map((_elem, index) => {
    //                 const checkmarkStart = index * DELAY_ANIMATION_PLAY;
    //                 const checkmarkEnd = checkmarkStart + ANIMATION_TIME;
    //                 // checkmark play
    //                 setTimeout(() => lottiesRef.current[index]?.current?.play(), checkmarkStart);
    //                 // checkmark pause
    //                 setTimeout(() => lottiesRef.current[index]?.current?.pause(), checkmarkEnd);

    //                 return (
    //                     <Lottie
    //                         key={index}
    //                         autoplay={false}
    //                         animationData={checkmarkAnimationData}
    //                         style={checkmarkStyle}
    //                         lottieRef={lottiesRef.current[index]}
    //                     />
    //                 );
    //             })}
    //             <Lottie
    //                 autoplay={false}
    //                 animationData={crossmarkAnimationData}
    //                 style={checkmarkStyle}
    //                 lottieRef={lottiesRef.current[maxTicketSize]}
    //             />
    //         </Animation>
    //     );
    // };

    return (
        <Modal title={t('markets.parlay.validation.title')} onClose={() => onClose()} shouldCloseOnOverlayClick={true}>
            <Container>
                {ticketError.code === TicketErrorCode.MAX_MATCHES && (
                    <>
                        <ErrorMessage>
                            {t('markets.parlay.validation.max-teams', { max: ticketError.data })}
                        </ErrorMessage>
                        {/* {getMaxMatchesAnimation()} */}
                    </>
                )}
                {ticketError.code === TicketErrorCode.SGP_DIFFERENT_GAME && (
                    <ErrorMessage>{t('markets.parlay.validation.sgp-different-game')}</ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.SGP_LEAGUE_DISABLED && (
                    <ErrorMessage>
                        {t('markets.parlay.validation.sgp-sport-disabled', { league: ticketError.data })}
                    </ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.OTHER_TYPES_WITH_PLAYER_PROPS && (
                    <ErrorMessage>{t('markets.parlay.validation.other-types-with-player-props')}</ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.SAME_PLAYER_DIFFERENT_TYPES && (
                    <ErrorMessage>
                        {t('markets.parlay.validation.same-player-different-types', { player: ticketError.data })}
                    </ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.PLAYER_PROPS_COMBINING_NOT_ENABLED && (
                    <ErrorMessage>
                        {t('markets.parlay.validation.player-props-combining-not-enabled', {
                            league: ticketError.data,
                        })}
                    </ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.FUTURES_COMBINING_NOT_SUPPORTED && (
                    <ErrorMessage>{t('markets.parlay.validation.futures-combining-not-supported')}</ErrorMessage>
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

const ErrorMessage = styled.p`
    margin-top: 20px;
    font-style: normal;
    font-size: 15px;
    line-height: 22px;
    color: ${(props) => props.theme.warning.textColor.primary};
    text-transform: uppercase;
`;

// const Animation = styled(FlexDivRowCentered)``;

// const checkmarkStyle: CSSProperties = {
//     width: 50,
//     margin: '0 -5px',
// };

export default React.memo(ValidationModal);
