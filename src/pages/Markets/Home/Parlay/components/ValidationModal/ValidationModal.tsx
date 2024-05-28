import checkmarkAnimationData from 'assets/lotties/green-checkmark.json';
import crossmarkAnimationData from 'assets/lotties/red-checkmark.json';
import Modal from 'components/Modal';
import { TicketErrorCode } from 'enums/markets';
import useInterval from 'hooks/useInterval';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import React, { createRef, CSSProperties, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getMaxTicketSize, getTicketError, resetTicketError } from 'redux/modules/ticket';
import styled, { useTheme } from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered } from 'styles/common';
import { ThemeInterface } from 'types/ui';

type ValidationModalProps = {
    onClose: () => void;
};

const DELAY_ANIMATION_PLAY = 200;
const ANIMATION_TIME = 1200;

const ValidationModal: React.FC<ValidationModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();

    const ticketError = useSelector(getTicketError);
    const maxTicketSize = useSelector(getMaxTicketSize);

    const lottiesRef = useRef([...Array(maxTicketSize + 1)].map(() => createRef<LottieRefCurrentProps>()));

    const crossmarkStart = maxTicketSize * DELAY_ANIMATION_PLAY;
    const crossmarkEnd = crossmarkStart + ANIMATION_TIME;

    useInterval(async () => {
        dispatch(resetTicketError());
    }, crossmarkEnd);

    const getMaxMatchesAnimation = () => {
        // crossmark play
        setTimeout(() => lottiesRef.current[maxTicketSize]?.current?.play(), crossmarkStart);
        // crossmark pause
        setTimeout(() => lottiesRef.current[maxTicketSize]?.current?.pause(), crossmarkEnd);

        return (
            <Animation>
                {[...Array(maxTicketSize)].map((_elem, index) => {
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
                    lottieRef={lottiesRef.current[maxTicketSize]}
                />
            </Animation>
        );
    };

    return (
        <Modal title={t('markets.parlay.validation.title')} onClose={() => onClose()} shouldCloseOnOverlayClick={true}>
            <Container>
                {ticketError.code === TicketErrorCode.MAX_MATCHES && (
                    <>
                        <ErrorMessage color={theme.status.win}>
                            {t('markets.parlay.validation.max-teams', { max: ticketError.data })}
                        </ErrorMessage>
                        {getMaxMatchesAnimation()}
                    </>
                )}
                {ticketError.code === TicketErrorCode.SAME_TEAM_TWICE && (
                    <ErrorMessage>
                        {t('markets.parlay.validation.team-in-parlay', { team: ticketError.data })}
                    </ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.MAX_DOUBLE_CHANCES && (
                    <ErrorMessage>
                        {t('markets.parlay.validation.max-double-chances', { max: ticketError.data })}
                    </ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.MAX_COMBINED_MARKETS && (
                    <ErrorMessage>
                        {t('markets.parlay.validation.max-combined-markets', { max: ticketError.data })}
                    </ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.MAX_NUMBER_OF_MARKETS_WITH_COMBINED_MARKETS && (
                    <ErrorMessage>
                        {t('markets.parlay.validation.max-number-of-markets-with-combined-markets', {
                            max: ticketError.data,
                        })}
                    </ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.SAME_EVENT_PARTICIPANT && (
                    <ErrorMessage>
                        {t('markets.parlay.validation.same-event-participant', {
                            existingParticipant: ticketError.data.split('/')[0],
                            addedParticipant: ticketError.data.split('/')[1],
                        })}
                    </ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.UNIQUE_TOURNAMENT_PLAYERS && (
                    <ErrorMessage>
                        {t('markets.parlay.validation.unique-players', {
                            existingParticipant: ticketError.data,
                        })}
                    </ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.SAME_GAME_OTHER_PLAYER_PROPS_TYPE && (
                    <ErrorMessage>{t('markets.parlay.validation.same-game-different-player-props')}</ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.ADDING_PLAYER_PROPS_ALREADY_HAVE_POSITION_OF_SAME_MARKET && (
                    <ErrorMessage>{t('markets.parlay.validation.player-props-and-other-positions')}</ErrorMessage>
                )}
                {ticketError.code === TicketErrorCode.COMBINE_REGULAR_WITH_COMBINED_POSITIONS && (
                    <ErrorMessage>{t('markets.parlay.validation.already-added-combined-positions')}</ErrorMessage>
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
    color: ${(props) => (props.color ? props.color : props.theme.textColor.primary)};
    text-transform: uppercase;
`;

const Animation = styled(FlexDivRowCentered)``;

const checkmarkStyle: CSSProperties = {
    width: 50,
    margin: '0 -5px',
};

export default React.memo(ValidationModal);
