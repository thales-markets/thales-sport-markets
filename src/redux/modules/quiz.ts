import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QUIZ_DURATION } from 'constants/quiz';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import localStore from 'utils/localStore';
import { RootState } from '../rootReducer';

const sliceName = 'quiz';

const getInitialQuizState = (): QuizSliceState => {
    const quizState = localStore.get(LOCAL_STORAGE_KEYS.QUIZ_STATE);
    return (quizState !== undefined ? quizState : defaultState) as QuizSliceState;
};

type QuizItem = {
    question: string;
    options: string[];
    questionNumber: number;
    points: number;
    answer: string;
};

type QuizSliceState = {
    isQuizStarted: boolean;
    isQuizFinished: boolean;
    playerUuid: string;
    currentQuestionIndex: number;
    quizItems: QuizItem[];
    score: number;
    endOfQuiz: number;
    twitter: string;
    discord: string;
};

const defaultState: QuizSliceState = {
    isQuizStarted: false,
    isQuizFinished: false,
    playerUuid: '',
    currentQuestionIndex: -1,
    quizItems: [],
    score: 0,
    endOfQuiz: 0,
    twitter: '',
    discord: '',
};

const initialState: QuizSliceState = getInitialQuizState();

export const uiSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        startQuiz: (state, action: PayloadAction<string>) => {
            state.isQuizStarted = true;
            state.playerUuid = action.payload;
            state.currentQuestionIndex = -1;
            state.endOfQuiz = new Date().getTime() + QUIZ_DURATION;
            localStore.set(LOCAL_STORAGE_KEYS.QUIZ_STATE, state);
        },
        addQuizItem: (state, action: PayloadAction<QuizItem>) => {
            state.quizItems = [...state.quizItems, action.payload];
            localStore.set(LOCAL_STORAGE_KEYS.QUIZ_STATE, state);
        },
        nextQuestion: (state) => {
            state.currentQuestionIndex = state.currentQuestionIndex + 1;
            localStore.set(LOCAL_STORAGE_KEYS.QUIZ_STATE, state);
        },
        previousQuestion: (state) => {
            state.currentQuestionIndex = state.currentQuestionIndex - 1;
            localStore.set(LOCAL_STORAGE_KEYS.QUIZ_STATE, state);
        },
        finishQuiz: (state, action: PayloadAction<number>) => {
            state.isQuizFinished = true;
            state.score = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.QUIZ_STATE, state);
        },
        resetQuiz: (state) => {
            const resetState = {
                ...defaultState,
                twitter: state.twitter,
                discord: state.discord,
            };
            localStore.set(LOCAL_STORAGE_KEYS.QUIZ_STATE, resetState);
            return resetState;
        },
        setAnswer: (state, action: PayloadAction<{ index: number; answer: string }>) => {
            state.quizItems[action.payload.index].answer = action.payload.answer;
            localStore.set(LOCAL_STORAGE_KEYS.QUIZ_STATE, state);
        },
        setTwitter: (state, action: PayloadAction<string>) => {
            state.twitter = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.QUIZ_STATE, state);
        },
        setDiscord: (state, action: PayloadAction<string>) => {
            state.discord = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.QUIZ_STATE, state);
        },
    },
});

export const {
    startQuiz,
    addQuizItem,
    nextQuestion,
    previousQuestion,
    finishQuiz,
    resetQuiz,
    setAnswer,
    setTwitter,
    setDiscord,
} = uiSlice.actions;

export const getQuizState = (state: RootState) => state[sliceName];
export const getIsQuizStarted = (state: RootState) => getQuizState(state).isQuizStarted;
export const getIsQuizFinished = (state: RootState) => getQuizState(state).isQuizFinished;
export const getPlayerUuid = (state: RootState) => getQuizState(state).playerUuid;
export const getCurrentQuestionIndex = (state: RootState) => getQuizState(state).currentQuestionIndex;
export const getCurrentQuizItem = (state: RootState) =>
    getQuizState(state).quizItems[getQuizState(state).currentQuestionIndex];
export const getCurrentNumberOfQuestions = (state: RootState) => getQuizState(state).quizItems.length;
export const getScore = (state: RootState) => getQuizState(state).score;
export const getEndOfQuiz = (state: RootState) => getQuizState(state).endOfQuiz;
export const getTwitter = (state: RootState) => getQuizState(state).twitter;
export const getDiscord = (state: RootState) => getQuizState(state).discord;

export default uiSlice.reducer;
