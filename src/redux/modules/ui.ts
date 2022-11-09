import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { Theme } from 'constants/ui';
import localStore from 'utils/localStore';
import { RootState } from '../rootReducer';
import { OddsType } from '../../constants/markets';
import { TAGS_LIST } from 'constants/tags';
import { Tags } from 'types/markets';

const sliceName = 'ui';

const getDefaultOddsType = (): OddsType => {
    const oddsType = localStore.get(LOCAL_STORAGE_KEYS.ODDS_TYPE);
    return (oddsType !== undefined ? oddsType : OddsType.AMM) as OddsType;
};

const getDefaultTheme = (): Theme => {
    const lsTheme = localStore.get(LOCAL_STORAGE_KEYS.UI_THEME);
    return (lsTheme !== undefined ? lsTheme : Theme.DARK) as Theme;
};

const getDefaultStopPulsing = (): boolean => {
    const lsStopPulsing = localStore.get(LOCAL_STORAGE_KEYS.STOP_PULSING);
    return (lsStopPulsing !== undefined ? lsStopPulsing : false) as boolean;
};

const getDefaultFavouriteLeagues = (): Tags => {
    const lsFavouriteLeagues = localStore.get(LOCAL_STORAGE_KEYS.FAVOURITE_LEAGUES);
    return (lsFavouriteLeagues !== undefined ? lsFavouriteLeagues : TAGS_LIST) as Tags;
};

type UISliceState = {
    theme: Theme;
    oddsType: OddsType;
    stopPulsing: boolean;
    favouriteLeagues: Tags;
};

const initialState: UISliceState = {
    theme: getDefaultTheme(),
    oddsType: getDefaultOddsType(),
    stopPulsing: getDefaultStopPulsing(),
    favouriteLeagues: getDefaultFavouriteLeagues(),
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
        setStopPulsing: (state, action: PayloadAction<boolean>) => {
            state.stopPulsing = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.STOP_PULSING, action.payload);
        },
        setFavouriteLeagues: (state, action: PayloadAction<Tags>) => {
            state.favouriteLeagues = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.FAVOURITE_LEAGUES, action.payload);
        },
    },
});

export const { setTheme, setOddsType, setStopPulsing, setFavouriteLeagues } = uiSlice.actions;

export const getUIState = (state: RootState) => state[sliceName];
export const getTheme = (state: RootState) => getUIState(state).theme;
export const getOddsType = (state: RootState) => getUIState(state).oddsType;
export const getStopPulsing = (state: RootState) => getUIState(state).stopPulsing;
export const getFavouriteLeagues = (state: RootState) => getUIState(state).favouriteLeagues;

export default uiSlice.reducer;
