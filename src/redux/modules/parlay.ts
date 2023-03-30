import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { COLLATERALS_INDEX } from 'constants/currency';
import { ParlayErrorCode } from 'constants/markets';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { MultiSingleAmounts, ParlayPayment, ParlaysMarketPosition } from 'types/markets';
import localStore from 'utils/localStore';
import { RootState } from '../rootReducer';

const sliceName = 'parlay';

const DEFAULT_MAX_NUMBER_OF_MATCHES = 8;
const MAX_NUMBER_OF_DOUBLE_CHANCES_ON_PARLAY = 5;

const getDefaultParlay = (): ParlaysMarketPosition[] => {
    const lsParlay = localStore.get(LOCAL_STORAGE_KEYS.PARLAY);
    return lsParlay !== undefined ? (lsParlay as ParlaysMarketPosition[]) : [];
};

const getDefaultPayment = (): ParlayPayment => {
    const lsSelectedStable = localStore.get(LOCAL_STORAGE_KEYS.STABLE_INDEX);

    return {
        selectedStableIndex:
            lsSelectedStable !== undefined ? (lsSelectedStable as COLLATERALS_INDEX) : COLLATERALS_INDEX.sUSD,
        isVoucherSelected: false,
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
    error: { code: ParlayErrorCode; data: string };
};

const initialState: ParlaySliceState = {
    parlay: getDefaultParlay(),
    parlaySize: DEFAULT_MAX_NUMBER_OF_MATCHES,
    payment: getDefaultPayment(),
    multiSingle: getDefaultMultiSingle(),
    isMultiSingle: getDefaultIsMultiSingle(),
    error: getDefaultError(),
};

export const parlaySlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        updateParlay: (state, action: PayloadAction<ParlaysMarketPosition>) => {
            const parlayCopy = [...state.parlay];
            const index = state.parlay.findIndex((el) => el.parentMarket === action.payload.parentMarket);
            const numberOfDoubleChances = parlayCopy.filter((market) => market.doubleChanceMarketType !== null).length;

            if (
                action.payload.doubleChanceMarketType !== null &&
                numberOfDoubleChances >= MAX_NUMBER_OF_DOUBLE_CHANCES_ON_PARLAY &&
                (index === -1 || parlayCopy[index].doubleChanceMarketType === null)
            ) {
                state.error.code = ParlayErrorCode.MAX_DOUBLE_CHANCES;
                state.error.data = MAX_NUMBER_OF_DOUBLE_CHANCES_ON_PARLAY.toString();
            } else if (index === -1) {
                // ADD new market
                if (state.parlay.length < state.parlaySize) {
                    const allParlayTeams = parlayCopy.map((market) => [market.homeTeam, market.awayTeam]).flat();

                    const homeTeamInParlay = allParlayTeams.filter((team) => team === action.payload.homeTeam)[0];
                    const awayTeamInParlay = allParlayTeams.filter((team) => team === action.payload.awayTeam)[0];

                    if (homeTeamInParlay || awayTeamInParlay) {
                        state.error.code = ParlayErrorCode.SAME_TEAM_TWICE;
                        state.error.data = homeTeamInParlay ? homeTeamInParlay : awayTeamInParlay;
                    } else {
                        state.multiSingle.push({
                            sportMarketAddress: action.payload.sportMarketAddress,
                            amountToBuy: 0,
                        });
                        state.parlay.push(action.payload);
                    }
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
        setParlaySize: (state, action: PayloadAction<number>) => {
            state.parlaySize = action.payload;
        },
        removeFromParlay: (state, action: PayloadAction<string>) => {
            state.parlay = state.parlay.filter((market) => market.sportMarketAddress !== action.payload);
            state.multiSingle = state.multiSingle.filter((ms) => ms.sportMarketAddress !== action.payload);

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
        removeFromMultiSingle: (state, action: PayloadAction<string>) => {
            state.multiSingle = state.multiSingle.filter((ms) => ms.sportMarketAddress !== action.payload);
            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
        },
        setPaymentSelectedStableIndex: (state, action: PayloadAction<COLLATERALS_INDEX>) => {
            state.payment = { ...state.payment, selectedStableIndex: action.payload };
        },
        resetParlayError: (state) => {
            state.error = getDefaultError();
        },
    },
});

export const getLastSavedOrDefaultStableIndex = (): COLLATERALS_INDEX => {
    const lsSelectedStable = localStore.get(LOCAL_STORAGE_KEYS.STABLE_INDEX);

    return lsSelectedStable !== undefined ? (lsSelectedStable as COLLATERALS_INDEX) : COLLATERALS_INDEX.sUSD;
};

export const {
    updateParlay,
    setParlaySize,
    removeFromParlay,
    removeAll,
    setPayment,
    setMultiSingle,
    setIsMultiSingle,
    setPaymentSelectedStableIndex,
    resetParlayError,
    removeFromMultiSingle,
} = parlaySlice.actions;

export const getParlayState = (state: RootState) => state[sliceName];
export const getParlay = (state: RootState) => getParlayState(state).parlay;
export const getMultiSingle = (state: RootState) => getParlayState(state).multiSingle;
export const getIsMultiSingle = (state: RootState) => getParlayState(state).isMultiSingle;
export const getParlaySize = (state: RootState) => getParlayState(state).parlaySize;
export const getParlayPayment = (state: RootState) => getParlayState(state).payment;
export const getParlayError = (state: RootState) => getParlayState(state).error;
export const getHasParlayError = createSelector(getParlayError, (error) => error.code != ParlayErrorCode.NO_ERROS);

export default parlaySlice.reducer;
