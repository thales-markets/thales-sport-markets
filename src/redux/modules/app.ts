import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'redux/rootReducer';

type AppSliceState = {
    isReady: boolean;
    isMobile: boolean;
};

const initialState: AppSliceState = {
    isReady: false,
    isMobile: window.innerWidth < 950,
};

const appSlice = createSlice({
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

const getAppState = (state: RootState) => state.app;
export const getIsAppReady = (state: RootState) => getAppState(state).isReady;
export const getIsMobile = (state: RootState) => getAppState(state).isMobile;

export const { setAppReady, setMobileState } = appSlice.actions;

export default appSlice.reducer;
