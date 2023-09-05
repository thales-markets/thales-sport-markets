import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { MultiSingleAmounts, ParlayPayment, ParlaysMarketPosition, SGPItem } from 'types/markets';
import localStore from 'utils/localStore';
import { RootState } from '../rootReducer';
import { getCombinedMarketsFromParlayData } from 'utils/combinedMarkets';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { GOLF_TAGS } from 'constants/tags';
import { ParlayErrorCode } from 'enums/markets';
import { canPlayerBeAddedToParlay } from 'utils/markets';

const sliceName = 'parlay';

const DEFAULT_MAX_NUMBER_OF_MATCHES = 10;
const MAX_NUMBER_OF_DOUBLE_CHANCES_ON_PARLAY = 10;
const MAX_NUMBER_OF_COMBINED_MARKETS_IN_PARLAY = 10;

const getDefaultParlay = (): ParlaysMarketPosition[] => {
    const lsParlay = localStore.get(LOCAL_STORAGE_KEYS.PARLAY);
    return lsParlay !== undefined ? (lsParlay as ParlaysMarketPosition[]) : [];
};

const getDefaultPayment = (): ParlayPayment => {
    const lsSelectedStableIndex = localStore.get(LOCAL_STORAGE_KEYS.STABLE_INDEX);

    return {
        selectedStableIndex: lsSelectedStableIndex !== undefined ? (lsSelectedStableIndex as number) : 0,
        isVoucherSelected: undefined,
        amountToBuy: '',
    };
};

const getDefaultMultiSingle = (): MultiSingleAmounts[] => {
    const lsMultiSingle = localStore.get(LOCAL_STORAGE_KEYS.MULTI_SINGLE);
    const lsParlay = localStore.get(LOCAL_STORAGE_KEYS.PARLAY);
    const defaultArr = lsParlay !== undefined ? (lsParlay as ParlaysMarketPosition[]) : [];

    return lsMultiSingle !== undefined
        ? (lsMultiSingle as MultiSingleAmounts[])
        : Array(defaultArr.length).fill({
              sportMarketAddress: '',
              amountToBuy: 0,
          });
};

const getDefaultIsMultiSingle = () => {
    const lsIsMultiSingle = localStore.get(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE);
    return lsIsMultiSingle !== undefined ? (lsIsMultiSingle as boolean) : false;
};

const getDefaultError = () => {
    return { code: ParlayErrorCode.NO_ERROS, data: '' };
};

type ParlaySliceState = {
    parlay: ParlaysMarketPosition[];
    parlaySize: number;
    payment: ParlayPayment;
    multiSingle: MultiSingleAmounts[];
    isMultiSingle: boolean;
    sgpFees: SGPItem[];
    error: { code: ParlayErrorCode; data: string };
};

const initialState: ParlaySliceState = {
    parlay: getDefaultParlay(),
    parlaySize: DEFAULT_MAX_NUMBER_OF_MATCHES,
    payment: getDefaultPayment(),
    multiSingle: getDefaultMultiSingle(),
    isMultiSingle: getDefaultIsMultiSingle(),
    sgpFees: [],
    error: getDefaultError(),
};

const parlaySlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        updateParlay: (state, action: PayloadAction<ParlaysMarketPosition>) => {
            const parlayCopy = [...state.parlay];
            const index = state.parlay.findIndex((el) => el.parentMarket === action.payload.parentMarket);
            const numberOfDoubleChances = parlayCopy.filter((market) => market.doubleChanceMarketType !== null).length;
            const combinedMarketsInParlay = getCombinedMarketsFromParlayData(state.parlay);

            if (combinedMarketsInParlay.length) {
                const nonCombinedMarkets =
                    state.parlay.length - combinedMarketsInParlay.length > 0
                        ? state.parlay.length - combinedMarketsInParlay.length
                        : 0;
                if (combinedMarketsInParlay.length + nonCombinedMarkets + 1 > state.parlaySize) {
                    state.error.code = ParlayErrorCode.MAX_NUMBER_OF_MARKETS_WITH_COMBINED_MARKETS;
                    state.error.data = DEFAULT_MAX_NUMBER_OF_MATCHES.toString();
                    return;
                }
            }
            const multipleSidesAtOneEvent = parlayCopy
                .filter((market) => market.isOneSideMarket)
                .map((market) => market.tag)
                .findIndex((tag) => tag == action.payload.tag);

            const existingGolfPlayerInParlay = parlayCopy
                .filter((market) => GOLF_TAGS.includes(Number(market.tag)))
                .findIndex(
                    (market) =>
                        market.homeTeam == action.payload.homeTeam ||
                        market.homeTeam == action.payload.awayTeam ||
                        market.awayTeam == action.payload.homeTeam ||
                        market.awayTeam == action.payload.awayTeam
                );

            if (
                action.payload.doubleChanceMarketType !== null &&
                numberOfDoubleChances >= MAX_NUMBER_OF_DOUBLE_CHANCES_ON_PARLAY &&
                (index === -1 || parlayCopy[index].doubleChanceMarketType === null)
            ) {
                state.error.code = ParlayErrorCode.MAX_DOUBLE_CHANCES;
                state.error.data = MAX_NUMBER_OF_DOUBLE_CHANCES_ON_PARLAY.toString();
            } else if (multipleSidesAtOneEvent !== -1) {
                const existingSide = parlayCopy
                    .filter((market) => market.isOneSideMarket)
                    .map((market) => market.homeTeam)[multipleSidesAtOneEvent];

                state.error.code = ParlayErrorCode.SAME_EVENT_PARTICIPANT;
                state.error.data =
                    fixOneSideMarketCompetitorName(existingSide) +
                    '/' +
                    fixOneSideMarketCompetitorName(action.payload.homeTeam);
            } else if (existingGolfPlayerInParlay != -1) {
                const existingHomeSide = parlayCopy
                    .filter((market) => GOLF_TAGS.includes(Number(market.tag)))
                    .map((market) => market.homeTeam)[existingGolfPlayerInParlay];

                const existingAwaySide = parlayCopy
                    .filter((market) => GOLF_TAGS.includes(Number(market.tag)))
                    .map((market) => market.awayTeam)[existingGolfPlayerInParlay];

                const existingSides =
                    action.payload.homeTeam == existingHomeSide
                        ? existingHomeSide
                        : action.payload.homeTeam == existingAwaySide
                        ? existingAwaySide
                        : action.payload.awayTeam == existingHomeSide
                        ? existingHomeSide
                        : existingAwaySide;

                state.error.code = ParlayErrorCode.UNIQUE_TOURNAMENT_PLAYERS;
                state.error.data = fixOneSideMarketCompetitorName(existingSides);
            } else if (index === -1) {
                // ADD new market
                if (state.parlay.length < state.parlaySize) {
                    const parlayTeamsByLeague = parlayCopy
                        .filter((market) => market.tags[0] === action.payload.tags[0])
                        .map((market) => [market.homeTeam, market.awayTeam])
                        .flat();

                    const homeTeamInParlay = parlayTeamsByLeague.filter((team) => team === action.payload.homeTeam)[0];
                    const awayTeamInParlay = parlayTeamsByLeague.filter((team) => team === action.payload.awayTeam)[0];

                    if (homeTeamInParlay || awayTeamInParlay) {
                        state.error.code = ParlayErrorCode.SAME_TEAM_TWICE;
                        state.error.data = homeTeamInParlay ? homeTeamInParlay : awayTeamInParlay;
                    } else {
                        state.multiSingle.push({
                            sportMarketAddress: action.payload.sportMarketAddress,
                            parentMarketAddress: action.payload.parentMarket,
                            amountToBuy: 0,
                        });
                        state.parlay.push(action.payload);
                    }
                } else {
                    state.error.code = ParlayErrorCode.MAX_MATCHES;
                    state.error.data = state.parlaySize.toString();
                }
            } else if (action.payload.playerId && canPlayerBeAddedToParlay(state.parlay, action.payload)) {
                if (state.parlay.length < state.parlaySize) {
                    state.multiSingle.push({
                        sportMarketAddress: action.payload.sportMarketAddress,
                        parentMarketAddress: action.payload.parentMarket,
                        amountToBuy: 0,
                    });
                    state.parlay.push(action.payload);
                } else {
                    state.error.code = ParlayErrorCode.MAX_MATCHES;
                    state.error.data = state.parlaySize.toString();
                }
            } else {
                // UPDATE market position
                parlayCopy[index].sportMarketAddress = action.payload.sportMarketAddress;
                parlayCopy[index].position = action.payload.position;
                parlayCopy[index].doubleChanceMarketType = action.payload.doubleChanceMarketType;
                state.parlay = [...parlayCopy];

                // reset multiSingle if position is changed
                const multiSingleCopy = [...state.multiSingle];
                multiSingleCopy[index].sportMarketAddress = action.payload.sportMarketAddress;
                multiSingleCopy[index].amountToBuy = 0;
                state.multiSingle = [...multiSingleCopy];
            }

            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
        },
        updateParlayWithMultiplePositions: (state, action: PayloadAction<ParlaysMarketPosition[]>) => {
            const combinedMarkets = getCombinedMarketsFromParlayData(state.parlay);
            const incomingCombinedMarkets = getCombinedMarketsFromParlayData(action.payload);

            if (incomingCombinedMarkets.length && Math.round(combinedMarkets.length / 2) == 4) {
                state.error.code = ParlayErrorCode.MAX_COMBINED_MARKETS;
                state.error.data = MAX_NUMBER_OF_COMBINED_MARKETS_IN_PARLAY.toString();
                return;
            }

            if (state.parlay.length + action.payload.length > state.parlaySize) {
                state.error.code = ParlayErrorCode.MAX_MATCHES;
                state.error.data = state.parlaySize.toString();
                return;
            }

            if (state.multiSingle.length == 0) {
                localStore.set(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE, false);
            }

            state.parlay.push(...action.payload);
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
        },
        setParlaySize: (state, action: PayloadAction<number>) => {
            state.parlaySize = action.payload;
        },
        removeFromParlay: (state, action: PayloadAction<string>) => {
            state.parlay = state.parlay.filter(
                (market) => market.sportMarketAddress !== action.payload && market.parentMarket !== action.payload
            );
            state.multiSingle = state.multiSingle.filter((ms) => ms.sportMarketAddress !== action.payload);

            if (state.multiSingle.length == 0) {
                state.isMultiSingle = false;
                localStore.set(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE, state.isMultiSingle);
            }

            if (state.parlay.length === 0) {
                state.payment.amountToBuy = getDefaultPayment().amountToBuy;
            }
            state.error = getDefaultError();
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
        },
        removeCombinedMarketFromParlay: (state, action: PayloadAction<string>) => {
            state.parlay = state.parlay.filter((market) => market.parentMarket !== action.payload);
            state.multiSingle = state.multiSingle.filter(
                (ms) => ms.sportMarketAddress !== action.payload && ms.parentMarketAddress !== action.payload
            );

            if (state.multiSingle.length == 0) {
                localStore.set(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE, false);
            }

            if (state.parlay.length === 0) {
                state.payment.amountToBuy = getDefaultPayment().amountToBuy;
            }
            state.error = getDefaultError();
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
        },
        removeAll: (state) => {
            state.parlay = [];
            state.payment.amountToBuy = getDefaultPayment().amountToBuy;
            state.multiSingle = [];
            state.error = getDefaultError();
            localStore.set(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE, false);
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
        },
        setPayment: (state, action: PayloadAction<ParlayPayment>) => {
            state.payment = { ...state.payment, ...action.payload };

            // Store the users last selected stable index
            localStore.set(LOCAL_STORAGE_KEYS.STABLE_INDEX, state.payment.selectedStableIndex);
        },
        setIsMultiSingle: (state, action: PayloadAction<boolean>) => {
            state.isMultiSingle = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE, state.isMultiSingle);
        },
        setMultiSingle: (state, action: PayloadAction<MultiSingleAmounts>) => {
            const index = state.multiSingle.findIndex(
                (el) => el.sportMarketAddress === action.payload.sportMarketAddress
            );
            if (index === -1) {
                state.multiSingle.push(action.payload);
            } else {
                const multiSingleCopy = [...state.multiSingle];
                multiSingleCopy[index].sportMarketAddress = action.payload.sportMarketAddress;
                multiSingleCopy[index].amountToBuy = action.payload.amountToBuy;
                state.multiSingle = [...multiSingleCopy];
            }
            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
        },
        setPaymentSelectedStableIndex: (state, action: PayloadAction<number>) => {
            state.payment = { ...state.payment, selectedStableIndex: action.payload };
        },
        resetParlayError: (state) => {
            state.error = getDefaultError();
        },
        setSGPFees: (state, action: PayloadAction<SGPItem[]>) => {
            state.sgpFees = [...action.payload];
            localStore.set(LOCAL_STORAGE_KEYS.SGP_FEES, state.sgpFees);
        },
    },
});

export const {
    updateParlay,
    updateParlayWithMultiplePositions,
    setParlaySize,
    removeFromParlay,
    removeCombinedMarketFromParlay,
    removeAll,
    setPayment,
    setMultiSingle,
    setIsMultiSingle,
    setPaymentSelectedStableIndex,
    resetParlayError,
    setSGPFees,
} = parlaySlice.actions;

const getParlayState = (state: RootState) => state[sliceName];
export const getParlay = (state: RootState) => getParlayState(state).parlay;
export const getMultiSingle = (state: RootState) => getParlayState(state).multiSingle;
export const getIsMultiSingle = (state: RootState) => getParlayState(state).isMultiSingle;
export const getParlaySize = (state: RootState) => getParlayState(state).parlaySize;
export const getParlayPayment = (state: RootState) => getParlayState(state).payment;
export const getParlayError = (state: RootState) => getParlayState(state).error;
export const getHasParlayError = createSelector(getParlayError, (error) => error.code != ParlayErrorCode.NO_ERROS);

export default parlaySlice.reducer;
