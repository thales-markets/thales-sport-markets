import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { SportFilter, StatusFilter } from 'enums/markets';
import { MarketType, MarketTypeGroup } from 'enums/marketTypes';
import { localStore } from 'thales-utils';
import { Tags } from 'types/markets';
import { SelectedMarket } from 'types/marketTypes';
import { MarketSliceState, RootState } from 'types/redux';

const sliceName = 'market';

const getDefaultMarketSearch = (): string => {
    const lsMarketSearch = localStore.get(LOCAL_STORAGE_KEYS.FILTER_MARKET_SEARCH);
    return lsMarketSearch !== undefined ? (lsMarketSearch as string) : '';
};

const getDefaultDatePeriodFilter = (): number => {
    const lsDatePeriodFilter = localStore.get(LOCAL_STORAGE_KEYS.FILTER_DATE_PERIOD);
    const datePeriodNumber = Number(lsDatePeriodFilter);
    return datePeriodNumber !== undefined && !isNaN(datePeriodNumber) ? datePeriodNumber : 0;
};

const getDefaultStatusFilter = (): StatusFilter => {
    const lsGlobalFilter = localStore.get(LOCAL_STORAGE_KEYS.FILTER_STATUS);
    return lsGlobalFilter !== undefined ? (lsGlobalFilter as StatusFilter) : StatusFilter.OPEN_MARKETS;
};

const getDefaultSportFilter = (): SportFilter => {
    const lsSportFilter = localStore.get(LOCAL_STORAGE_KEYS.FILTER_SPORT);
    return lsSportFilter !== undefined ? (lsSportFilter as SportFilter) : SportFilter.All;
};

const getDefaultTagFilter = (): Tags => {
    const lsTagFilter = localStore.get(LOCAL_STORAGE_KEYS.FILTER_TAGS);
    return lsTagFilter !== undefined ? (lsTagFilter as Tags) : [];
};

const getDefaultIsThreeWayView = (): boolean => {
    const lsIsThreeWayView = localStore.get(LOCAL_STORAGE_KEYS.IS_THREE_WAY_VIEW);
    return lsIsThreeWayView !== undefined ? (lsIsThreeWayView as boolean) : true;
};

const initialState: MarketSliceState = {
    marketSearch: getDefaultMarketSearch(),
    datePeriodFilter: getDefaultDatePeriodFilter(),
    statusFilter: getDefaultStatusFilter(),
    sportFilter: getDefaultSportFilter(),
    marketTypeFilter: undefined,
    marketTypeGroupFilter: undefined,
    tagFilter: getDefaultTagFilter(),
    selectedMarket: undefined,
    isThreeWayView: getDefaultIsThreeWayView(),
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
        setDatePeriodFilter: (state, action: PayloadAction<number>) => {
            state.datePeriodFilter = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.FILTER_DATE_PERIOD, action.payload);

            state.selectedMarket = undefined;
        },
        setStatusFilter: (state, action: PayloadAction<StatusFilter>) => {
            state.statusFilter = action.payload;
            if (action.payload !== StatusFilter.OPEN_MARKETS) {
                state.selectedMarket = undefined;
            }
            localStore.set(LOCAL_STORAGE_KEYS.FILTER_STATUS, action.payload);

            state.datePeriodFilter = 0;
            localStore.set(LOCAL_STORAGE_KEYS.FILTER_DATE_PERIOD, 0);
        },
        setSportFilter: (state, action: PayloadAction<SportFilter>) => {
            state.sportFilter = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.FILTER_SPORT, action.payload);

            state.selectedMarket = undefined;
            state.marketTypeFilter = undefined;
            state.marketTypeGroupFilter = undefined;

            if (action.payload === SportFilter.All) {
                state.datePeriodFilter = 0;
                localStore.set(LOCAL_STORAGE_KEYS.FILTER_DATE_PERIOD, 0);
            }
        },
        setTagFilter: (state, action: PayloadAction<Tags>) => {
            state.tagFilter = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.FILTER_TAGS, action.payload);

            state.selectedMarket = undefined;
        },
        setSelectedMarket: (state, action: PayloadAction<SelectedMarket | undefined>) => {
            if (
                !action.payload ||
                (!state.selectedMarket && action.payload) ||
                (state.selectedMarket && action.payload && state.selectedMarket.sport !== action.payload.sport)
            ) {
                state.marketTypeGroupFilter = undefined;
            }
            state.selectedMarket = action.payload;
        },
        setIsThreeWayView: (state, action: PayloadAction<boolean>) => {
            state.isThreeWayView = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.IS_THREE_WAY_VIEW, action.payload);
        },
        setMarketTypeFilter: (state, action: PayloadAction<MarketType | undefined>) => {
            state.marketTypeFilter = action.payload;
        },
        setMarketTypeGroupFilter: (state, action: PayloadAction<MarketTypeGroup | undefined>) => {
            state.marketTypeGroupFilter = action.payload;
        },
    },
});

export const {
    setMarketSearch,
    setDatePeriodFilter,
    setStatusFilter,
    setSportFilter,
    setTagFilter,
    setSelectedMarket,
    setIsThreeWayView,
    setMarketTypeFilter,
    setMarketTypeGroupFilter,
} = marketSlice.actions;

const getMarketState = (state: RootState) => state[sliceName];
export const getMarketSearch = (state: RootState) => getMarketState(state).marketSearch;
export const getDatePeriodFilter = (state: RootState) => getMarketState(state).datePeriodFilter;
export const getStatusFilter = (state: RootState) => getMarketState(state).statusFilter;
export const getSportFilter = (state: RootState) => getMarketState(state).sportFilter;
export const getTagFilter = (state: RootState) => getMarketState(state).tagFilter;
export const getMarketTypeFilter = (state: RootState) => getMarketState(state).marketTypeFilter;
export const getMarketTypeGroupFilter = (state: RootState) => getMarketState(state).marketTypeGroupFilter;
export const getSelectedMarket = (state: RootState) => getMarketState(state).selectedMarket;
export const getIsMarketSelected = (state: RootState) => !!getMarketState(state).selectedMarket;
export const getIsThreeWayView = (state: RootState) => getMarketState(state).isThreeWayView;

export default marketSlice.reducer;
