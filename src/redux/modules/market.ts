import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { GlobalFiltersEnum, SportFilterEnum } from 'enums/markets';
import { localStore } from 'thales-utils';
import { SportMarket, Tags } from 'types/markets';
import { MarketType } from '../../enums/marketTypes';
import { RootState } from '../rootReducer';

const sliceName = 'market';

const getDefaultMarketSearch = (): string => {
    const lsMarketSearch = localStore.get(LOCAL_STORAGE_KEYS.FILTER_MARKET_SEARCH);
    return lsMarketSearch !== undefined ? (lsMarketSearch as string) : '';
};

const getDefaultDateFilter = (): Date | number => {
    const lsDateFilter = localStore.get(LOCAL_STORAGE_KEYS.FILTER_DATE);
    const dateNumber = Number(lsDateFilter);
    return lsDateFilter !== undefined ? (isNaN(dateNumber) ? new Date(lsDateFilter as string) : dateNumber) : 0;
};

const getDefaultGlobalFilter = (): GlobalFiltersEnum => {
    const lsGlobalFilter = localStore.get(LOCAL_STORAGE_KEYS.FILTER_GLOBAL);
    return lsGlobalFilter !== undefined ? (lsGlobalFilter as GlobalFiltersEnum) : GlobalFiltersEnum.OpenMarkets;
};

const getDefaultSportFilter = (): SportFilterEnum => {
    const lsSportFilter = localStore.get(LOCAL_STORAGE_KEYS.FILTER_SPORT);
    return lsSportFilter !== undefined ? (lsSportFilter as SportFilterEnum) : SportFilterEnum.All;
};

const getDefaultTagFilter = (): Tags => {
    const lsTagFilter = localStore.get(LOCAL_STORAGE_KEYS.FILTER_TAGS);
    return lsTagFilter !== undefined ? (lsTagFilter as Tags) : [];
};

const getDefaultIsThreeWayView = (): boolean => {
    const lsIsThreeWayView = localStore.get(LOCAL_STORAGE_KEYS.IS_THREE_WAY_VIEW);
    return lsIsThreeWayView !== undefined ? (lsIsThreeWayView as boolean) : true;
};

type MarketSliceState = {
    marketSearch: string;
    dateFilter: Date | number;
    globalFilter: GlobalFiltersEnum;
    sportFilter: SportFilterEnum;
    marketTypeFilter: MarketType[];
    tagFilter: Tags;
    selectedMarket: Pick<SportMarket, 'gameId' | 'sport'> | undefined;
    isThreeWayView: boolean;
};

const initialState: MarketSliceState = {
    marketSearch: getDefaultMarketSearch(),
    dateFilter: getDefaultDateFilter(),
    globalFilter: getDefaultGlobalFilter(),
    sportFilter: getDefaultSportFilter(),
    tagFilter: getDefaultTagFilter(),
    selectedMarket: undefined,
    isThreeWayView: getDefaultIsThreeWayView(),
    marketTypeFilter: [],
};

const marketSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setMarketSearch: (state, action: PayloadAction<string>) => {
            state.marketSearch = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.FILTER_MARKET_SEARCH, action.payload);

            state.selectedMarket = undefined;
        },
        setDateFilter: (state, action: PayloadAction<Date | number>) => {
            state.dateFilter = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.FILTER_DATE, action.payload);

            state.selectedMarket = undefined;
        },
        setGlobalFilter: (state, action: PayloadAction<GlobalFiltersEnum>) => {
            state.globalFilter = action.payload;
            if (action.payload !== GlobalFiltersEnum.OpenMarkets) {
                state.selectedMarket = undefined;
            }
            localStore.set(LOCAL_STORAGE_KEYS.FILTER_GLOBAL, action.payload);
        },
        setSportFilter: (state, action: PayloadAction<SportFilterEnum>) => {
            state.sportFilter = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.FILTER_SPORT, action.payload);

            state.selectedMarket = undefined;
        },
        setTagFilter: (state, action: PayloadAction<Tags>) => {
            state.tagFilter = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.FILTER_TAGS, action.payload);

            state.selectedMarket = undefined;
        },
        setSelectedMarket: (state, action: PayloadAction<Pick<SportMarket, 'gameId' | 'sport'> | undefined>) => {
            state.selectedMarket = action.payload;
        },
        setIsThreeWayView: (state, action: PayloadAction<boolean>) => {
            state.isThreeWayView = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.IS_THREE_WAY_VIEW, action.payload);
        },
        setMarketTypeFilter: (state, action: PayloadAction<MarketType[]>) => {
            state.marketTypeFilter = action.payload;
        },
    },
});

export const {
    setMarketSearch,
    setDateFilter,
    setGlobalFilter,
    setSportFilter,
    setTagFilter,
    setSelectedMarket,
    setIsThreeWayView,
    setMarketTypeFilter,
} = marketSlice.actions;

const getMarketState = (state: RootState) => state[sliceName];
export const getMarketSearch = (state: RootState) => getMarketState(state).marketSearch;
export const getDateFilter = (state: RootState) => getMarketState(state).dateFilter;
export const getGlobalFilter = (state: RootState) => getMarketState(state).globalFilter;
export const getSportFilter = (state: RootState) => getMarketState(state).sportFilter;
export const getTagFilter = (state: RootState) => getMarketState(state).tagFilter;
export const getMarketTypeFilter = (state: RootState) => getMarketState(state).marketTypeFilter;
export const getSelectedMarket = (state: RootState) => getMarketState(state).selectedMarket;
export const getIsMarketSelected = (state: RootState) => !!getMarketState(state).selectedMarket;
export const getIsThreeWayView = (state: RootState) => getMarketState(state).isThreeWayView;

export default marketSlice.reducer;
