import React, { useEffect, useRef, useState } from 'react';
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
    Input,
    QuestionWeightContainer,
    TimeRemainingText,
    TimeRemainingGraphicContainer,
    TimeRemainingGraphicPercentage,
    OptionsContainer,
    QuestionIndicator,
    CurrentQuestion,
    Footer,
    ValidationTooltip,
    LoaderContainer,
    QuestionIndicatorContainer,
    QuizFirstNextContainer,
    QuizSecondNextContainer,
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
    MAX_SCORE,
    NEXT_QUESTION_PATH,
    NUMBER_OF_QUESTIONS,
    QUIZ_API_URL,
    QUIZ_DURATION,
    START_QUIZ_PATH,
} from 'constants/quiz';
import SPAAnchor from 'components/SPAAnchor';
import SimpleLoader from 'components/SimpleLoader';

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
    const [percentageTimeRemaining, setPercentageTimeRemaining] = useState<number>(0);
    const [isTwitterValid, setIsTwitterValid] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const firstUpdate = useRef(true);
    useEffect(() => {
        firstUpdate.current = false;
    }, []);

    const isStartQuizDisabled = !twitterHandle || twitterHandle.trim() === '' || isSubmitting;
    const isQuizInProgress = isQuizStarted && !isQuizFinished && currentQuizItem;

    const handleStartQuiz = async () => {
        setIsSubmitting(true);
        try {
            const startQuizResponse = await axios.post(`${QUIZ_API_URL}${START_QUIZ_PATH}`, {
                twitter: twitterHandle.trim(),
                wallet: walletAddress,
            });
            const playerUuid = startQuizResponse.data.data;
            const nextQuestionResponse = await axios.get(
                `${QUIZ_API_URL}${NEXT_QUESTION_PATH}?playerUUID=${playerUuid}`
            );
            dispatch(startQuiz(playerUuid));
            dispatch(addQuizItem(nextQuestionResponse.data.data));
            dispatch(nextQuestion());
        } catch (e) {
            setIsTwitterValid(false);
            console.log(e);
        }
        setIsSubmitting(false);
    };

    const handleNextQuestion = async () => {
        setIsSubmitting(true);
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
        setIsSubmitting(false);
    };

    const handlePreviousQuestion = () => dispatch(previousQuestion());

    const handleFinishQuiz = async (submitAnswer: boolean) => {
        setIsSubmitting(true);
        try {
            if (submitAnswer && currentQuizItem && currentQuizItem.answer && currentQuizItem.answer !== '') {
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
        setIsSubmitting(false);
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
                        <SubmitButton onClick={handlePreviousQuestion} isNavigation disabled={isSubmitting}>
                            {t('quiz.button.previous-question-label')}
                        </SubmitButton>
                    )}
                    {currentQuestionIndex < NUMBER_OF_QUESTIONS - 1 && (
                        <SubmitButton onClick={handleNextQuestion} isNavigation disabled={isSubmitting}>
                            {t('quiz.button.next-question-label')}
                        </SubmitButton>
                    )}
                    {currentQuestionIndex == NUMBER_OF_QUESTIONS - 1 && (
                        <SubmitButton onClick={() => handleFinishQuiz(true)} isNavigation disabled={isSubmitting}>
                            {t('quiz.button.finish-quiz-label')}
                        </SubmitButton>
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
        if (isQuizStarted && !isQuizFinished) {
            if (new Date().getTime() > endOfQuiz) {
                handleFinishQuiz(false);
            }
        }
    }, 1000);

    useInterval(async () => {
        if (isQuizStarted && !isQuizFinished) {
            const secondRemaining = (endOfQuiz - new Date().getTime()) / 1000;
            const percentageRemaining = secondRemaining > 0 ? (secondRemaining * 100) / (QUIZ_DURATION / 1000) : 0;
            setPercentageTimeRemaining(percentageRemaining);
        }
    }, 1000);

    return (
        <>
            <BackToLink link={buildHref(ROUTES.Markets.Home)} text={t('market.back-to-markets')} />
            <Container>
                {isQuizInProgress && (
                    <>
                        <TimeRemainingText>
                            <Trans
                                i18nKey="quiz.time-reamining-label"
                                components={[<TimeRemaining end={endOfQuiz} fontSize={18} key="timeRemaining" />]}
                            />
                        </TimeRemainingText>
                        <TimeRemainingGraphicContainer>
                            <TimeRemainingGraphicPercentage
                                width={percentageTimeRemaining}
                                firstUpdate={firstUpdate.current}
                            ></TimeRemainingGraphicPercentage>
                        </TimeRemainingGraphicContainer>
                    </>
                )}
                <QuizContainer>
                    {isSubmitting ? (
                        <LoaderContainer>
                            <SimpleLoader />
                        </LoaderContainer>
                    ) : (
                        <>
                            {!isQuizStarted && (
                                <>
                                    <Title>{t('quiz.title')}</Title>
                                    <Description>{t('quiz.start-quiz-description')}</Description>
                                    <FlexDivCentered>
                                        <ValidationTooltip
                                            open={!isTwitterValid}
                                            title={t('quiz.twitter-handle-validation') as string}
                                        >
                                            <Input
                                                type="text"
                                                placeholder={t('quiz.twitter-handle-placeholder')}
                                                value={twitterHandle}
                                                onChange={(event) => {
                                                    setIsTwitterValid(true);
                                                    setTwitterHandle(event.target.value);
                                                }}
                                            />
                                        </ValidationTooltip>
                                    </FlexDivCentered>
                                    <ButtonContainer>{getSubmitButton()}</ButtonContainer>
                                </>
                            )}
                            {isQuizInProgress && (
                                <>
                                    <QuestionWeightContainer>
                                        {`${currentQuizItem.points} ${
                                            Number(currentQuizItem.points) === 1
                                                ? t('quiz.point-label')
                                                : t('quiz.points-label')
                                        }`}
                                    </QuestionWeightContainer>
                                    <Question>{currentQuizItem.question}</Question>
                                    <OptionsContainer>
                                        {currentQuizItem.options.map((option) => {
                                            return (
                                                <RadioButton
                                                    checked={option === currentQuizItem.answer}
                                                    value={option}
                                                    onChange={() =>
                                                        dispatch(
                                                            setAnswer({ index: currentQuestionIndex, answer: option })
                                                        )
                                                    }
                                                    label={option}
                                                    key={`option${option}`}
                                                />
                                            );
                                        })}
                                    </OptionsContainer>
                                </>
                            )}
                            {isQuizFinished && (
                                <>
                                    <FinishedInfoContainer>
                                        <FinishedInfoLabel>{t('quiz.quiz-finished-label')}</FinishedInfoLabel>
                                        <FinishedInfo>
                                            {t('quiz.your-score-label', {
                                                score: score,
                                                max: MAX_SCORE,
                                            })}
                                        </FinishedInfo>
                                    </FinishedInfoContainer>
                                    <ButtonContainer>{getSubmitButton()}</ButtonContainer>
                                </>
                            )}
                        </>
                    )}
                </QuizContainer>
                {isQuizInProgress && (
                    <>
                        {currentQuestionIndex < NUMBER_OF_QUESTIONS - 1 && <QuizFirstNextContainer />}
                        {currentQuestionIndex < NUMBER_OF_QUESTIONS - 2 && <QuizSecondNextContainer />}
                    </>
                )}
                {isQuizInProgress && (
                    <Footer>
                        <ButtonContainer>{getSubmitButton()}</ButtonContainer>
                        <CurrentQuestion>
                            {t('quiz.current-question-label', {
                                currentQuestion: currentQuestionIndex + 1,
                                numberOfQuestions: NUMBER_OF_QUESTIONS,
                            })}
                        </CurrentQuestion>
                        <QuestionIndicatorContainer>
                            {[...Array(NUMBER_OF_QUESTIONS)].map((_, i) => {
                                return (
                                    <QuestionIndicator key={i} isPassed={i <= currentQuestionIndex}></QuestionIndicator>
                                );
                            })}
                        </QuestionIndicatorContainer>
                    </Footer>
                )}
            </Container>
        </>
    );
};

export default Quiz;
