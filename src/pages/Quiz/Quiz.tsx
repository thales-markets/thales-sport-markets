import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import axios from 'axios';
import BackToLink from 'pages/Markets/components/BackToLink';
import ROUTES from 'constants/routes';
import { buildHref } from 'utils/routes';
import {
    Container,
    QuizContainer,
    Title,
    Question,
    FinishedInfo,
    FinishedInfoContainer,
    FinishedInfoLabel,
    ButtonContainer,
    TimeRemainingText,
    TimeRemainingGraphicContainer,
    TimeRemainingGraphicPercentage,
    OptionsContainer,
    QuestionIndicator,
    CurrentQuestion,
    Footer,
    LoaderContainer,
    QuestionIndicatorContainer,
    QuizFirstNextContainer,
    QuizSecondNextContainer,
    InputContainer,
    QuizLink,
    Copy,
    FinishedInfoMessage,
    FinishedInfoMessagesContainer,
    DifficultyContainer,
    DifficultyLabel,
    DifficultyInfo,
    Wrapper,
    defaultButtonProps,
} from './styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getWalletAddress } from 'redux/modules/wallet';
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
    getTwitter,
    getDiscord,
    setTwitter,
    setDiscord,
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
import { LINKS } from 'constants/links';
import HelpUsImprove from './HelpUsImprove';
import useQuizLeaderboardQuery from 'queries/quiz/useQuizLeaderboardQuery';
import { FinishInfo, LeaderboardItem } from 'types/quiz';
import ordinal from 'ordinal';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import TextInput from 'components/fields/TextInput';
import { useTheme } from 'styled-components';
import { ThemeInterface } from 'types/ui';
import Button from 'components/Button';

const Quiz: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isQuizStarted = useSelector((state: RootState) => getIsQuizStarted(state));
    const isQuizFinished = useSelector((state: RootState) => getIsQuizFinished(state));
    const playerUuid = useSelector((state: RootState) => getPlayerUuid(state));
    const currentQuizItem = useSelector((state: RootState) => getCurrentQuizItem(state));
    const currentQuestionIndex = useSelector((state: RootState) => getCurrentQuestionIndex(state));
    const currentNumberOfQuestions = useSelector((state: RootState) => getCurrentNumberOfQuestions(state));
    const twitter = useSelector((state: RootState) => getTwitter(state));
    const discord = useSelector((state: RootState) => getDiscord(state));
    const score = useSelector((state: RootState) => getScore(state));
    const endOfQuiz = useSelector((state: RootState) => getEndOfQuiz(state));
    const [percentageTimeRemaining, setPercentageTimeRemaining] = useState<number>(0);
    const [isTwitterValid, setIsTwitterValid] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { openConnectModal } = useConnectModal();

    const isStartQuizDisabled = !twitter || twitter.trim() === '' || isSubmitting;
    const isQuizInProgress = isQuizStarted && !isQuizFinished && currentQuizItem;

    const quizLeaderboardQuery = useQuizLeaderboardQuery();

    const finishInfo: FinishInfo = useMemo(() => {
        if (quizLeaderboardQuery.isSuccess && quizLeaderboardQuery.data) {
            const leaderboard = quizLeaderboardQuery.data[quizLeaderboardQuery.data.length - 1].leaderboard;

            const leaderboardItem = leaderboard.find(
                (item: LeaderboardItem) => item.name.trim().toLowerCase() === twitter.trim().toLowerCase()
            );
            if (leaderboardItem) {
                return {
                    rank: leaderboardItem.ranking,
                    points: leaderboardItem.points,
                    totalParticipants: leaderboard.length,
                };
            }
        }

        return {
            rank: 0,
            points: 0,
            totalParticipants: 0,
            lastRankPointsWithRewards: 0,
            isQualifiedForRewards: false,
        };
    }, [quizLeaderboardQuery.data, quizLeaderboardQuery.isSuccess, twitter]);

    const handleStartQuiz = async () => {
        setIsSubmitting(true);
        try {
            const startQuizResponse = await axios.post(`${QUIZ_API_URL}${START_QUIZ_PATH}`, {
                twitter: twitter.trim(),
                wallet: walletAddress,
                discord: discord.trim(),
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
                quizLeaderboardQuery.refetch();
                dispatch(finishQuiz(score));
            }
        } catch (e) {
            console.log(e);
            // reset quiz when it is stuck in the "try finish" loop
            handleNewQuiz();
        }
        setIsSubmitting(false);
    };

    const handleNewQuiz = () => dispatch(resetQuiz());

    const getSubmitButton = () => {
        if (!isWalletConnected && !isQuizFinished) {
            return (
                <Button onClick={() => openConnectModal?.()} {...defaultButtonProps}>
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }

        if (isQuizFinished) {
            return (
                <>
                    <Button onClick={handleNewQuiz} {...defaultButtonProps}>
                        {t('quiz.button.try-again-label')}
                    </Button>
                    <SPAAnchor href={buildHref(ROUTES.QuizLeaderboard)}>
                        <Button onClick={() => {}}>{t('quiz.button.see-leaderboard-label')}</Button>
                    </SPAAnchor>
                </>
            );
        }

        if (isQuizStarted) {
            return (
                <>
                    {currentQuestionIndex > 0 && (
                        <Button
                            onClick={handlePreviousQuestion}
                            disabled={isSubmitting}
                            backgroundColor={theme.button.background.quaternary}
                            borderColor={theme.button.borderColor.secondary}
                            {...defaultButtonProps}
                        >
                            {t('quiz.button.previous-question-label')}
                        </Button>
                    )}
                    {currentQuestionIndex < NUMBER_OF_QUESTIONS - 1 && (
                        <Button
                            onClick={handleNextQuestion}
                            disabled={isSubmitting}
                            backgroundColor={theme.button.background.quaternary}
                            borderColor={theme.button.borderColor.secondary}
                            {...defaultButtonProps}
                        >
                            {t('quiz.button.next-question-label')}
                        </Button>
                    )}
                    {currentQuestionIndex == NUMBER_OF_QUESTIONS - 1 && (
                        <Button
                            onClick={() => handleFinishQuiz(true)}
                            disabled={isSubmitting}
                            backgroundColor={theme.button.background.quaternary}
                            borderColor={theme.button.borderColor.secondary}
                            {...defaultButtonProps}
                        >
                            {t('quiz.button.finish-quiz-label')}
                        </Button>
                    )}
                </>
            );
        }

        return (
            <Button disabled={isStartQuizDisabled} onClick={handleStartQuiz} {...defaultButtonProps}>
                {t('quiz.button.start-quiz-label')}
            </Button>
        );
    };

    useInterval(async () => {
        if (isQuizStarted && !isQuizFinished) {
            if (new Date().getTime() > endOfQuiz) {
                handleFinishQuiz(false);
            }
            const secondRemaining = (endOfQuiz - new Date().getTime()) / 1000;
            const percentageRemaining = secondRemaining > 0 ? (secondRemaining * 100) / (QUIZ_DURATION / 1000) : 0;
            setPercentageTimeRemaining(percentageRemaining);
        }
    }, 1000);

    return (
        <Wrapper>
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
                                    <Copy>
                                        <Trans
                                            i18nKey="quiz.start-quiz-description"
                                            components={{
                                                p: <p />,
                                                discord: <QuizLink href={LINKS.ThalesDiscord} key="discord" />,
                                            }}
                                        />
                                    </Copy>
                                    <InputContainer>
                                        <TextInput
                                            placeholder={t('quiz.twitter-handle-placeholder')}
                                            value={twitter}
                                            onChange={(event: any) => {
                                                setIsTwitterValid(true);
                                                dispatch(setTwitter(event.target.value));
                                            }}
                                            label={t('quiz.twitter-handle-label')}
                                            showValidation={!isTwitterValid}
                                            validationMessage={t('quiz.twitter-handle-validation')}
                                        />
                                    </InputContainer>
                                    <InputContainer>
                                        <TextInput
                                            placeholder={t('quiz.discord-placeholder')}
                                            value={discord}
                                            onChange={(event: any) => {
                                                dispatch(setDiscord(event.target.value));
                                            }}
                                            label={t('quiz.discord-label')}
                                        />
                                    </InputContainer>
                                    <ButtonContainer>{getSubmitButton()}</ButtonContainer>
                                </>
                            )}
                            {isQuizInProgress && (
                                <>
                                    <DifficultyContainer>
                                        <DifficultyLabel>{t('quiz.difficulty-label')}: </DifficultyLabel>
                                        <DifficultyInfo difficulty={Number(currentQuizItem.points)}>
                                            {`${t(`quiz.difficulty.${Number(currentQuizItem.points)}`)} (${
                                                currentQuizItem.points
                                            } ${
                                                Number(currentQuizItem.points) === 1
                                                    ? t('quiz.point-label')
                                                    : t('quiz.points-label')
                                            })`}
                                        </DifficultyInfo>
                                    </DifficultyContainer>
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
                                        <FinishedInfoMessage>
                                            {t('quiz.finish-messages.your-best-result', {
                                                points: finishInfo.points,
                                                pointsLabel:
                                                    Number(finishInfo.points) === 1
                                                        ? t('quiz.point-label')
                                                        : t('quiz.points-label'),
                                            })}
                                        </FinishedInfoMessage>
                                    </FinishedInfoContainer>
                                    <FinishedInfoMessagesContainer>
                                        <FinishedInfoMessage>
                                            {t('quiz.finish-messages.rank-info', {
                                                rank: ordinal(finishInfo.rank),
                                                totalParticipants: finishInfo.totalParticipants,
                                                points: finishInfo.points,
                                                pointsLabel:
                                                    Number(finishInfo.points) === 1
                                                        ? t('quiz.point-label')
                                                        : t('quiz.points-label'),
                                            })}
                                        </FinishedInfoMessage>
                                    </FinishedInfoMessagesContainer>
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
                        <ButtonContainer mobileDirection="column-reverse">{getSubmitButton()}</ButtonContainer>
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
                {!isQuizInProgress && (
                    <Footer>
                        <HelpUsImprove />
                    </Footer>
                )}
            </Container>
        </Wrapper>
    );
};

export default Quiz;
