import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSliceState, RootState } from 'types/redux';
import { isMobile } from 'utils/device';

const initialState: AppSliceState = {
    isMobile: isMobile(),
    isMiniapp: false,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setMobileState: (state, action: PayloadAction<boolean>) => {
            state.isMobile = action.payload;
        },
        setMiniappState: (state, action: PayloadAction<boolean>) => {
            state.isMiniapp = action.payload;
        },
    },
});

const getAppState = (state: RootState) => state.app;
export const getIsMobile = (state: RootState) => getAppState(state).isMobile;
export const getIsMiniapp = (state: RootState) => getAppState(state).isMiniapp;
export const { setMobileState, setMiniappState } = appSlice.actions;

export default appSlice.reducer;
