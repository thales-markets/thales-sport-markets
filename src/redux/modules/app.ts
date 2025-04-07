import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSliceState, RootState } from 'types/redux';
import { isMobile } from 'utils/device';

const initialState: AppSliceState = {
    isMobile: isMobile(),
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setMobileState: (state, action: PayloadAction<boolean>) => {
            state.isMobile = action.payload;
        },
    },
});

const getAppState = (state: RootState) => state.app;
export const getIsMobile = (state: RootState) => getAppState(state).isMobile;

export const { setMobileState } = appSlice.actions;

export default appSlice.reducer;
