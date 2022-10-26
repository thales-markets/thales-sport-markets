import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { COLLATERALS_INDEX } from 'constants/currency';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { ParlayPayment, ParlaysMarketPosition } from 'types/markets';
import localStore from 'utils/localStore';
import { RootState } from '../rootReducer';

const sliceName = 'parlay';

const MAX_NUMBER_OF_MATCHES = 4;

const getDefaultParlay = (): ParlaysMarketPosition[] => {
    const lsParlay = localStore.get(LOCAL_STORAGE_KEYS.PARLAY);
    return lsParlay !== undefined ? (lsParlay as ParlaysMarketPosition[]).slice(0, MAX_NUMBER_OF_MATCHES) : [];
};

const getDefaultPayment = (): ParlayPayment => {
    return {
        selectedStableIndex: COLLATERALS_INDEX.sUSD,
        isVoucherSelected: true,
        amountToBuy: '',
    };
};

type ParlaySliceState = {
    parlay: ParlaysMarketPosition[];
    payment: ParlayPayment;
    error: boolean;
};

const initialState: ParlaySliceState = {
    parlay: getDefaultParlay(),
    payment: getDefaultPayment(),
    error: false,
};

export const parlaySlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        updateParlay: (state, action: PayloadAction<ParlaysMarketPosition>) => {
            const index = state.parlay.findIndex((el) => el.sportMarketId === action.payload.sportMarketId);
            if (index === -1) {
                // ADD new market
                if (state.parlay.length < MAX_NUMBER_OF_MATCHES) {
                    state.parlay.push(action.payload);
                } else {
                    state.error = true;
                }
            } else {
                // UPDATE market
                const parlayCopy = [...state.parlay];
                parlayCopy[index].position = action.payload.position;
                state.parlay = [...parlayCopy];
            }

            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
        },
        removeFromParlay: (state, action: PayloadAction<string>) => {
            state.parlay = state.parlay.filter((market) => market.sportMarketId !== action.payload);
            if (state.parlay.length === 0) {
                state.payment = getDefaultPayment();
            }
            state.error = false;
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
        },
        removeAll: (state) => {
            state.parlay = [];
            state.payment = getDefaultPayment();
            state.error = false;
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
        },
        setPayment: (state, action: PayloadAction<ParlayPayment>) => {
            state.payment = { ...state.payment, ...action.payload };
        },
        resetParlayError: (state) => {
            state.error = false;
        },
    },
});

export const { updateParlay, removeFromParlay, removeAll, setPayment, resetParlayError } = parlaySlice.actions;

export const getParlayState = (state: RootState) => state[sliceName];
export const getParlay = (state: RootState) => getParlayState(state).parlay;
export const getParlayPayment = (state: RootState) => getParlayState(state).payment;
export const getParlayError = (state: RootState) => getParlayState(state).error;

export default parlaySlice.reducer;
