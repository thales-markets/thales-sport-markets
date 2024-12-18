import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { ThemeMap } from 'constants/ui';
import { OddsType } from 'enums/markets';
import { Theme } from 'enums/ui';
import { uniqBy } from 'lodash';
import { localStore } from 'thales-utils';
import { TagInfo, Tags } from 'types/markets';
import { OverdropUIState } from 'types/overdrop';
import { RootState, UISliceState } from 'types/redux';
import { LeagueMap } from '../../constants/sports';
import { League } from '../../enums/sports';

const sliceName = 'ui';

const getDefaultOddsType = (): OddsType => {
    const oddsType = localStore.get(LOCAL_STORAGE_KEYS.ODDS_TYPE);
    return (oddsType !== undefined ? oddsType : OddsType.DECIMAL) as OddsType;
};

export const getDefaultTheme = (): Theme => {
    const lsTheme = localStore.get(LOCAL_STORAGE_KEYS.UI_THEME);
    return (lsTheme !== undefined && ThemeMap[lsTheme as Theme] !== undefined ? lsTheme : Theme.DARK) as Theme;
};

const getDefaultStopPulsing = (): boolean => {
    const lsStopPulsing = localStore.get(LOCAL_STORAGE_KEYS.STOP_PULSING);
    return (lsStopPulsing !== undefined ? lsStopPulsing : false) as boolean;
};

const getDefaultFavouriteLeagues = (): Tags => {
    const lsFavouriteLeagues = localStore.get(LOCAL_STORAGE_KEYS.FAVOURITE_LEAGUES);
    return (lsFavouriteLeagues !== undefined ? uniqBy(lsFavouriteLeagues as Tags, 'id') : []) as Tags;
};

const getDefaultOverdropState = (): OverdropUIState[] => {
    const lsOverdropState = localStore.get(LOCAL_STORAGE_KEYS.OVERDROP_STATE);

    return lsOverdropState ? (lsOverdropState as OverdropUIState[]) : [];
};

const getDefaultValueForOverdropWelcomeModal = (): boolean => {
    const lsWelcomeModalFlag = localStore.get(LOCAL_STORAGE_KEYS.OVERDROP_WELCOME_MODAL_FLAG);
    return lsWelcomeModalFlag ? (lsWelcomeModalFlag as boolean) : false;
};

const getDefaultValueForPreventOverdropModals = (): boolean => {
    const lsPreventDefaultFlag = localStore.get(LOCAL_STORAGE_KEYS.OVERDROP_PREVENT_DAILY_MODAL);
    return lsPreventDefaultFlag ? (lsPreventDefaultFlag as boolean) : false;
};

const getStakingModalMuteEnd = (): number => {
    const stakingModalMuteEnd = localStore.get(LOCAL_STORAGE_KEYS.STAKING_MODAL_MUTE_END);
    return stakingModalMuteEnd as number;
};

const initialState: UISliceState = {
    theme: getDefaultTheme(),
    oddsType: getDefaultOddsType(),
    stopPulsing: getDefaultStopPulsing(),
    favouriteLeagues: getDefaultFavouriteLeagues(),
    overdropState: getDefaultOverdropState(),
    overdropPreventMultipliersModal: getDefaultValueForPreventOverdropModals(),
    overdropWelcomeModal: getDefaultValueForOverdropWelcomeModal(),
    stakingModalMuteEnd: getStakingModalMuteEnd(),
};

const uiSlice = createSlice({
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
        setFavouriteLeague: (state, action: PayloadAction<League>) => {
            const leagueInfo = LeagueMap[action.payload];
            const existingFavouriteIndex = state.favouriteLeagues.findIndex(
                (league: TagInfo) => league.id === action.payload
            );
            if (existingFavouriteIndex > -1) {
                state.favouriteLeagues = state.favouriteLeagues.filter(
                    (league: TagInfo) => league.id !== action.payload
                );
            } else {
                if (leagueInfo) {
                    state.favouriteLeagues.push({
                        id: leagueInfo.id,
                        label: leagueInfo.label,
                    });
                }
            }
            localStore.set(LOCAL_STORAGE_KEYS.FAVOURITE_LEAGUES, state.favouriteLeagues);
        },
        setOverdropState: (state, action: PayloadAction<OverdropUIState>) => {
            const overdropStateItemIndex = state.overdropState.findIndex(
                (item) => item.walletAddress == action.payload.walletAddress
            );

            if (overdropStateItemIndex !== -1) {
                state.overdropState[overdropStateItemIndex] = action.payload;
            } else {
                state.overdropState.push(action.payload);
            }
            localStore.set(LOCAL_STORAGE_KEYS.OVERDROP_STATE, state.overdropState);
        },
        setDefaultOverdropState: (state, action: PayloadAction<{ walletAddress: string }>) => {
            const existingOverdropStateItemIndex = state.overdropState.findIndex(
                (item) => item.walletAddress?.toLowerCase() == action.payload.walletAddress?.toLowerCase()
            );

            if (existingOverdropStateItemIndex == -1) {
                state.overdropState.push({
                    walletAddress: action.payload.walletAddress,
                    dailyMultiplier: 0,
                    currentLevel: 0,
                });
                localStore.set(LOCAL_STORAGE_KEYS.OVERDROP_STATE, state.overdropState);
            }
        },
        setWelcomeModalVisibility: (state, action: PayloadAction<{ showWelcomeModal: boolean }>) => {
            state.overdropWelcomeModal = action.payload.showWelcomeModal;
            localStore.set(LOCAL_STORAGE_KEYS.OVERDROP_WELCOME_MODAL_FLAG, action.payload.showWelcomeModal);
        },
        setPreventOverdropModalValue: (state, action: PayloadAction<{ preventFlag: boolean }>) => {
            state.overdropPreventMultipliersModal = action.payload.preventFlag;
            localStore.set(LOCAL_STORAGE_KEYS.OVERDROP_PREVENT_DAILY_MODAL, action.payload.preventFlag);
        },
        setStakingModalMuteEnd: (state, action: PayloadAction<number>) => {
            state.stakingModalMuteEnd = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.STAKING_MODAL_MUTE_END, action.payload);
        },
    },
});

export const {
    setTheme,
    setOddsType,
    setStopPulsing,
    setFavouriteLeague,
    setOverdropState,
    setDefaultOverdropState,
    setWelcomeModalVisibility,
    setPreventOverdropModalValue,
    setStakingModalMuteEnd,
} = uiSlice.actions;

const getUIState = (state: RootState) => state[sliceName];
export const getTheme = (state: RootState) => getUIState(state).theme;
export const getOddsType = (state: RootState) => getUIState(state).oddsType;
export const getStopPulsing = (state: RootState) => getUIState(state).stopPulsing;
export const getFavouriteLeagues = (state: RootState) => getUIState(state).favouriteLeagues;
export const getOverdropUIState = (state: RootState) => getUIState(state).overdropState;
export const getOverdropWelcomeModalFlag = (state: RootState) => getUIState(state).overdropWelcomeModal;
export const getOverdropPreventShowingModal = (state: RootState) => getUIState(state).overdropPreventMultipliersModal;
export const getIsStakingModalMuted = (state: RootState) =>
    getUIState(state).stakingModalMuteEnd > new Date().getTime();

export default uiSlice.reducer;
