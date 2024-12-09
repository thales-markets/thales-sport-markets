import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'redux/rootReducer';

type AppSliceState = {
    isMobile: boolean;
};

const initialState: AppSliceState = {
    isMobile: window.innerWidth < 950,
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
