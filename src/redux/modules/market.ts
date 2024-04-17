import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { localStore } from 'thales-utils';
import { RootState } from '../rootReducer';

const sliceName = 'market';

const getDefaultMarketSearch = (): string => {
    const lsMarketSearch = localStore.get(LOCAL_STORAGE_KEYS.FILTER_MARKET_SEARCH);
    return lsMarketSearch !== undefined ? (lsMarketSearch as string) : '';
};

type MarketSliceState = {
    marketSearch: string;
    selectedMarket: string;
};

const initialState: MarketSliceState = {
    marketSearch: getDefaultMarketSearch(),
    selectedMarket: '',
};

const marketSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setMarketSearch: (state, action: PayloadAction<string>) => {
            state.marketSearch = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.FILTER_MARKET_SEARCH, action.payload);
        },
        setSelectedMarket: (state, action: PayloadAction<string>) => {
            state.selectedMarket = action.payload;
        },
    },
});

export const { setMarketSearch, setSelectedMarket } = marketSlice.actions;

const getMarketState = (state: RootState) => state[sliceName];
export const getMarketSearch = (state: RootState) => getMarketState(state).marketSearch;
export const getSelectedMarket = (state: RootState) => getMarketState(state).selectedMarket;
export const getIsMarketSelected = (state: RootState) => getMarketState(state).selectedMarket !== '';

export default marketSlice.reducer;
