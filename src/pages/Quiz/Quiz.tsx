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
    Input,
    QuestionWeightContainer,
} from './styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getWalletAddress } from 'redux/modules/wallet';
import onboardConnector from 'utils/onboardConnector';
import { FlexDivCentered } from 'styles/common';
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
import RadioButton from 'components/fields/RadioButton';
import TimeRemaining from 'components/TimeRemaining';
import useInterval from 'hooks/useInterval';
import {
    ANSWER_QUESTION_PATH,
    FINISH_QUIZ_PATH,
    NEXT_QUESTION_PATH,
    NUMBER_OF_QUESTIONS,
    QUIZ_API_URL,
    START_QUIZ_PATH,
} from 'constants/quiz';
import SPAAnchor from 'components/SPAAnchor';

const Quiz: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isQuizStarted = useSelector((state: RootState) => getIsQuizStarted(state));
    const isQuizFinished = useSelector((state: RootState) => getIsQuizFinished(state));
    const playerUuid = useSelector((state: RootState) => getPlayerUuid(state));
    const currentQuizItem = useSelector((state: RootState) => getCurrentQuizItem(state));
    const currentQuestionIndex = useSelector((state: RootState) => getCurrentQuestionIndex(state));
    const currentNumberOfQuestions = useSelector((state: RootState) => getCurrentNumberOfQuestions(state));
    const score = useSelector((state: RootState) => getScore(state));
    const endOfQuiz = useSelector((state: RootState) => getEndOfQuiz(state));
    const [twitterHandle, setTwitterHandle] = useState<string>('');

    const isStartQuizDisabled = !twitterHandle || twitterHandle.trim() === '';

    const handleStartQuiz = async () => {
        try {
            const startQuizResponse = await axios.post(`${QUIZ_API_URL}${START_QUIZ_PATH}`, {
                twitter: twitterHandle,
                wallet: walletAddress,
            });
            const playerUuid = startQuizResponse.data.data;
            dispatch(startQuiz(playerUuid));

            const nextQuestionResponse = await axios.get(
                `${QUIZ_API_URL}${NEXT_QUESTION_PATH}?playerUUID=${playerUuid}`
            );
            dispatch(addQuizItem(nextQuestionResponse.data.data));
            dispatch(nextQuestion());
        } catch (e) {
            console.log(e);
        }
    };

    const handleNextQuestion = async () => {
        try {
            if (currentQuizItem.answer && currentQuizItem.answer !== '') {
                await axios.post(`${QUIZ_API_URL}${ANSWER_QUESTION_PATH}`, {
                    playerUUID: playerUuid,
                    answer: currentQuizItem.answer,
                    questionNumber: currentQuizItem.questionNumber,
                });
            }
            if (currentQuestionIndex == currentNumberOfQuestions - 1) {
                const nextQuestionResponse = await axios.get(
                    `${QUIZ_API_URL}${NEXT_QUESTION_PATH}?playerUUID=${playerUuid}`
                );
                dispatch(addQuizItem(nextQuestionResponse.data.data));
            }
            dispatch(nextQuestion());
        } catch (e) {
            console.log(e);
        }
    };

    const handlePreviousQuestion = () => dispatch(previousQuestion());

    const handleFinishQuiz = async () => {
        try {
            if (currentQuizItem.answer && currentQuizItem.answer !== '') {
                await axios.post(`${QUIZ_API_URL}${ANSWER_QUESTION_PATH}`, {
                    playerUUID: playerUuid,
                    answer: currentQuizItem.answer,
                    questionNumber: currentQuizItem.questionNumber,
                });
            }
            if (isQuizStarted && !isQuizFinished) {
                const finishQuizResponse = await axios.post(`${QUIZ_API_URL}${FINISH_QUIZ_PATH}`, {
                    playerUUID: playerUuid,
                });
                const score = finishQuizResponse.data.data;
                dispatch(finishQuiz(score));
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleNewQuiz = () => dispatch(resetQuiz());

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
                    <SPAAnchor href={buildHref(ROUTES.QuizLeaderboard)}>
                        <SubmitButton onClick={() => {}}>{t('quiz.button.see-leaderboard-label')}</SubmitButton>
                    </SPAAnchor>
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
                            <QuestionWeightContainer>
                                <Description>
                                    {t('quiz.question-weight-label', {
                                        points: `${currentQuizItem.points} ${
                                            Number(currentQuizItem.points) === 1
                                                ? t('quiz.point-label')
                                                : t('quiz.points-label')
                                        }`,
                                    })}
                                </Description>
                            </QuestionWeightContainer>
                        </>
                    )}
                    {isQuizFinished && (
                        <>
                            <FinishedInfoContainer>
                                <FinishedInfoLabel>{t('quiz.quiz-finished-label')}</FinishedInfoLabel>
                                <FinishedInfo>
                                    {t('quiz.your-score-label', {
                                        score: `${score} ${
                                            Number(score) === 1 ? t('quiz.point-label') : t('quiz.points-label')
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

export default Quiz;
