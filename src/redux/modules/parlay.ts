import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { ParlaysMarketPosition } from 'types/markets';
import localStore from 'utils/localStore';
import { RootState } from '../rootReducer';

const sliceName = 'parlay';

const getDefaultParlay = (): ParlaysMarketPosition[] => {
    const lsParlay = localStore.get(LOCAL_STORAGE_KEYS.PARLAY);
    return lsParlay !== undefined ? (lsParlay as ParlaysMarketPosition[]) : [];
};

type ParlaySliceState = {
    parlay: ParlaysMarketPosition[];
};

const initialState: ParlaySliceState = {
    parlay: getDefaultParlay(),
};

export const parlaySlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        updateParlay: (state, action: PayloadAction<ParlaysMarketPosition>) => {
            const index = state.parlay.findIndex((el) => el.sportMarketId === action.payload.sportMarketId);
            if (index === -1) {
                state.parlay.push(action.payload);
            } else {
                const parlayCopy = [...state.parlay];
                parlayCopy[index].position = action.payload.position;
                state.parlay = [...parlayCopy];
            }

            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
        },
        removeFromParlay: (state, action: PayloadAction<string>) => {
            state.parlay = state.parlay.filter((market) => market.sportMarketId !== action.payload);
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
        },
    },
});

export const { updateParlay, removeFromParlay } = parlaySlice.actions;

export const getParlayState = (state: RootState) => state[sliceName];
export const getParlay = (state: RootState) => getParlayState(state).parlay;

export default parlaySlice.reducer;
