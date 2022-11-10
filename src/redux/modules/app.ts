import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'redux/rootReducer';

export type AppSliceState = {
    isReady: boolean;
    isMobile: boolean;
};

const initialState: AppSliceState = {
    isReady: false,
    isMobile: false,
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setAppReady: (state) => {
            state.isReady = true;
        },
        setMobileState: (state, action: PayloadAction<boolean>) => {
            state.isMobile = action.payload;
        },
    },
});

export const getAppState = (state: RootState) => state.app;
export const getIsAppReady = (state: RootState) => getAppState(state).isReady;
export const getIsMobile = (state: RootState) => getAppState(state).isMobile;

export const { setAppReady, setMobileState } = appSlice.actions;

export default appSlice.reducer;
