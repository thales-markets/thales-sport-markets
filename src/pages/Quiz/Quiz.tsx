import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import axios from 'axios';
import BackToLink from 'pages/Markets/components/BackToLink';
import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import {
    Container,
    QuizContainer,
    Description,
    Title,
    Question,
    SubmitButton,
    FinishedInfo,
    FinishedInfoContainer,
    FinishedInfoLabel,
    ButtonContainer,
    Header,
} from './styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getWalletAddress } from 'redux/modules/wallet';
import onboardConnector from 'utils/onboardConnector';
import { FlexDivCentered, FlexDivEnd } from 'styles/common';
import {
    getIsQuizStarted,
    startQuiz,
    addQuizItem,
    getPlayerUuid,
    getCurrentQuizItem,
    getCurrentQuestionIndex,
    previousQuestion,
    getCurrentNumberOfQuestions,
    nextQuestion,
    finishQuiz,
    getIsQuizFinished,
    getScore,
    resetQuiz,
    setAnswer,
    getEndOfQuiz,
} from 'redux/modules/quiz';
import styled from 'styled-components';
import RadioButton from 'components/fields/RadioButton';
import TimeRemaining from 'components/TimeRemaining';
import useInterval from 'hooks/useInterval';

const NUMBER_OF_QUESTIONS = 10;

const Rewards: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isQuizStarted = useSelector((state: RootState) => getIsQuizStarted(state));
    const isQuizFinished = useSelector((state: RootState) => getIsQuizFinished(state));
    const playerUUID = useSelector((state: RootState) => getPlayerUuid(state));
    const currentQuizItem = useSelector((state: RootState) => getCurrentQuizItem(state));
    const currentQuestionIndex = useSelector((state: RootState) => getCurrentQuestionIndex(state));
    const currentNumberOfQuestions = useSelector((state: RootState) => getCurrentNumberOfQuestions(state));
    const score = useSelector((state: RootState) => getScore(state));
    const endOfQuiz = useSelector((state: RootState) => getEndOfQuiz(state));

    const [twitterHandle, setTwitterHandle] = useState<string>('');

    const isStartQuizDisabled = !twitterHandle || twitterHandle.trim() === '';

    const handleStartQuiz = async () => {
        try {
            const startQuizResponse = await axios.post('https://overtime-trivia.herokuapp.com/start', {
                twitter: twitterHandle,
                wallet: walletAddress,
            });
            const playerUUID = startQuizResponse.data.data;
            dispatch(startQuiz(playerUUID));

            const nextQuestionResponse = await axios.get(
                `https://overtime-trivia.herokuapp.com/next/question?playerUUID=${playerUUID}`
            );
            dispatch(addQuizItem(nextQuestionResponse.data.data));
            dispatch(nextQuestion());
        } catch (e) {
            console.log(e);
        }
    };

    const handleNextQuestion = async () => {
        try {
            if (currentQuestionIndex == currentNumberOfQuestions - 1) {
                const nextQuestionResponse = await axios.get(
                    `https://overtime-trivia.herokuapp.com/next/question?playerUUID=${playerUUID}`
                );
                dispatch(addQuizItem(nextQuestionResponse.data.data));
            }
            if (currentQuizItem.answer && currentQuizItem.answer !== '')
                await axios.post('https://overtime-trivia.herokuapp.com/answer', {
                    playerUUID,
                    answer: currentQuizItem.answer,
                    questionNumber: currentQuizItem.questionNumber,
                });
            dispatch(nextQuestion());
        } catch (e) {
            console.log(e);
        }
    };

    const handlePreviousQuestion = async () => {
        try {
            dispatch(previousQuestion());
        } catch (e) {
            console.log(e);
        }
    };

    const handleFinishQuiz = async () => {
        try {
            if (isQuizStarted && !isQuizFinished) {
                const finishQuizResponse = await axios.post('https://overtime-trivia.herokuapp.com/finish', {
                    playerUUID,
                });
                const points = finishQuizResponse.data.data;

                dispatch(finishQuiz(points));
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleNewQuiz = async () => {
        try {
            dispatch(resetQuiz());
        } catch (e) {
            console.log(e);
        }
    };

    const getSubmitButton = () => {
        if (!isWalletConnected && !isQuizFinished) {
            return (
                <SubmitButton onClick={() => onboardConnector.connectWallet()}>
                    {t('common.wallet.connect-your-wallet')}
                </SubmitButton>
            );
        }

        if (isQuizFinished) {
            return (
                <>
                    <SubmitButton onClick={handleNewQuiz}>{t('quiz.button.try-again-label')}</SubmitButton>
                    <SubmitButton onClick={() => {}}>{t('quiz.button.see-leaderboard-label')}</SubmitButton>
                </>
            );
        }

        if (isQuizStarted) {
            return (
                <>
                    {currentQuestionIndex > 0 && (
                        <SubmitButton onClick={handlePreviousQuestion}>
                            {t('quiz.button.previous-question-label')}
                        </SubmitButton>
                    )}
                    {currentQuestionIndex < NUMBER_OF_QUESTIONS - 1 && (
                        <SubmitButton onClick={handleNextQuestion}>{t('quiz.button.next-question-label')}</SubmitButton>
                    )}
                    {currentQuestionIndex == NUMBER_OF_QUESTIONS - 1 && (
                        <SubmitButton onClick={handleFinishQuiz}>{t('quiz.button.finish-quiz-label')}</SubmitButton>
                    )}
                </>
            );
        }

        return (
            <SubmitButton disabled={isStartQuizDisabled} onClick={handleStartQuiz}>
                {t('quiz.button.start-quiz-label')}
            </SubmitButton>
        );
    };

    useInterval(async () => {
        if (new Date().getTime() > endOfQuiz) {
            handleFinishQuiz();
        }
    }, 1000);

    return (
        <>
            <BackToLink link={buildHref(ROUTES.Markets.Home)} text={t('market.back-to-markets')} />
            <Container>
                <QuizContainer>
                    {!isQuizFinished && <Title>{isQuizFinished ? '' : t('quiz.title')}</Title>}
                    {!isQuizStarted && (
                        <>
                            <Description>{t('quiz.start-quiz-description')}</Description>
                            <FlexDivCentered>
                                <Input
                                    type="text"
                                    placeholder={t('quiz.twitter-handle-placeholder')}
                                    value={twitterHandle}
                                    onChange={(event) => setTwitterHandle(event.target.value)}
                                />
                            </FlexDivCentered>
                        </>
                    )}
                    {isQuizStarted && !isQuizFinished && currentQuizItem && (
                        <>
                            <Header>
                                <Description>
                                    {t('quiz.current-question-label', {
                                        currentQuestion: currentQuestionIndex + 1,
                                        numberOfQuestions: NUMBER_OF_QUESTIONS,
                                    })}
                                </Description>
                                <Description>
                                    <Trans
                                        i18nKey="quiz.time-reamining-label"
                                        components={[
                                            <TimeRemaining end={endOfQuiz} fontSize={18} key="timeRemaining" />,
                                        ]}
                                    />
                                </Description>
                            </Header>
                            <Question>{currentQuizItem.question}</Question>
                            {currentQuizItem.options.map((option) => {
                                return (
                                    <RadioButton
                                        checked={option === currentQuizItem.answer}
                                        value={option}
                                        onChange={() =>
                                            dispatch(setAnswer({ index: currentQuestionIndex, answer: option }))
                                        }
                                        label={option}
                                        key={`option${option}`}
                                    />
                                );
                            })}
                            <FlexDivEnd>
                                <Description>
                                    {`${currentQuizItem.points} ${
                                        currentQuizItem.points === 1 ? t('quiz.point-label') : t('quiz.points-label')
                                    }`}
                                </Description>
                            </FlexDivEnd>
                        </>
                    )}
                    {isQuizFinished && (
                        <>
                            <FinishedInfoContainer>
                                <FinishedInfoLabel>{t('quiz.quiz-finished-label')}</FinishedInfoLabel>
                                <FinishedInfo>
                                    {t('quiz.your-score-label', {
                                        score: `${score} ${
                                            score === 1 ? t('quiz.point-label') : t('quiz.points-label')
                                        }`,
                                    })}
                                </FinishedInfo>
                            </FinishedInfoContainer>
                        </>
                    )}
                    <ButtonContainer>{getSubmitButton()}</ButtonContainer>
                </QuizContainer>
            </Container>
        </>
    );
};

const Input = styled.input`
    background: ${(props) => props.theme.background.secondary};
    border-radius: 5px;
    border: 2px solid #1a1c2b;
    color: ${(props) => props.theme.textColor.primary};
    width: 300px;
    height: 34px;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 18px;
    outline: none;
    &::placeholder {
        color: ${(props) => props.theme.textColor.primary};
    }
    &:focus {
        border: 2px solid #3fd1ff !important;
    }
`;

export default Rewards;
