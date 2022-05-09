import { createSlice } from '@reduxjs/toolkit';
import { RootState } from 'redux/rootReducer';

export type AppSliceState = {
    isReady: boolean;
};

const initialState: AppSliceState = {
    isReady: false,
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setAppReady: (state) => {
            state.isReady = true;
        },
    },
});

export const getAppState = (state: RootState) => state.app;
export const getIsAppReady = (state: RootState) => getAppState(state).isReady;

export const { setAppReady } = appSlice.actions;

export default appSlice.reducer;
