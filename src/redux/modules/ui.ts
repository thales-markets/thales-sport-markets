import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { Theme } from 'constants/ui';
import localStore from 'utils/localStore';
import { RootState } from '../rootReducer';
import { OddsType } from '../../constants/markets';

const sliceName = 'ui';

const getDefaultOddsType = (): OddsType => {
    const oddsType = localStore.get(LOCAL_STORAGE_KEYS.ODDS_TYPE);
    return (oddsType !== undefined ? oddsType : OddsType.AMM) as OddsType;
};

const getDefaultTheme = (): Theme => {
    const lsTheme = localStore.get(LOCAL_STORAGE_KEYS.UI_THEME);
    return (lsTheme !== undefined ? lsTheme : Theme.DARK) as Theme;
};

type UISliceState = {
    theme: Theme;
    oddsType: OddsType;
};

const initialState: UISliceState = {
    theme: getDefaultTheme(),
    oddsType: getDefaultOddsType(),
};

export const uiSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<number>) => {
            state.theme = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.UI_THEME, action.payload);
        },
        setOddsType: (state, action: PayloadAction<OddsType>) => {
            state.oddsType = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.ODDS_TYPE, action.payload);
        },
    },
});

export const { setTheme } = uiSlice.actions;
export const { setOddsType } = uiSlice.actions;

export const getUIState = (state: RootState) => state[sliceName];
export const getTheme = (state: RootState) => getUIState(state).theme;
export const getOddsType = (state: RootState) => getUIState(state).oddsType;

export default uiSlice.reducer;
