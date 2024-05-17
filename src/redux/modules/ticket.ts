import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { ParlayErrorCode } from 'enums/markets';
import { Network } from 'enums/network';
import { localStore } from 'thales-utils';
import { ParlayPayment, TicketPosition } from 'types/markets';
import { RootState } from '../rootReducer';

const sliceName = 'ticket';

const DEFAULT_MAX_TICKET_SIZE = 10;

const getDefaultTicket = (): TicketPosition[] => {
    const lsParlay = localStore.get(LOCAL_STORAGE_KEYS.PARLAY);
    return lsParlay !== undefined ? (lsParlay as TicketPosition[]) : [];
};

const getDefaultPayment = (): ParlayPayment => {
    const lsSelectedCollateralIndex = localStore.get(
        `${LOCAL_STORAGE_KEYS.COLLATERAL_INDEX}${Network.OptimismMainnet}`
    );

    return {
        selectedCollateralIndex: lsSelectedCollateralIndex !== undefined ? (lsSelectedCollateralIndex as number) : 0,
        isVoucherAvailable: false,
        isVoucherSelected: false,
        amountToBuy: '',
        networkId: Network.OptimismMainnet,
    };
};

const getDefaultError = () => {
    return { code: ParlayErrorCode.NO_ERROS, data: '' };
};

type TicketSliceState = {
    ticket: TicketPosition[];
    payment: ParlayPayment;
    maxTicketSize: number;
    isMultiSingle: boolean;
    error: { code: ParlayErrorCode; data: string };
};

const initialState: TicketSliceState = {
    ticket: getDefaultTicket(),
    payment: getDefaultPayment(),
    maxTicketSize: DEFAULT_MAX_TICKET_SIZE,
    isMultiSingle: false,
    error: getDefaultError(),
};

const ticketSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        updateTicket: (state, action: PayloadAction<TicketPosition>) => {
            const ticketCopy = [...state.ticket];
            const existingPositionIndex = state.ticket.findIndex((el) => el.gameId === action.payload.gameId);

            // UPDATE market position
            if (action.payload.live) {
                state.ticket = [action.payload];
            } else if (existingPositionIndex === -1) {
                state.ticket.push(action.payload);
            } else {
                ticketCopy[existingPositionIndex] = action.payload;
                state.ticket = [...ticketCopy];
            }

            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.ticket);
        },
        setMaxTicketSize: (state, action: PayloadAction<number>) => {
            state.maxTicketSize = action.payload;
        },
        removeFromTicket: (state, action: PayloadAction<string>) => {
            state.ticket = state.ticket.filter((market) => market.gameId !== action.payload);

            if (state.ticket.length === 0) {
                state.payment.amountToBuy = getDefaultPayment().amountToBuy;
            }
            state.error = getDefaultError();
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.ticket);
        },
        removeAll: (state) => {
            state.ticket = [];
            state.payment.amountToBuy = getDefaultPayment().amountToBuy;
            state.error = getDefaultError();
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.ticket);
        },
        setPayment: (state, action: PayloadAction<ParlayPayment>) => {
            state.payment = { ...state.payment, ...action.payload };

            // Store the users last selected stable index
            localStore.set(
                `${LOCAL_STORAGE_KEYS.COLLATERAL_INDEX}${state.payment.networkId}`,
                state.payment.selectedCollateralIndex
            );
        },
        setPaymentSelectedCollateralIndex: (
            state,
            action: PayloadAction<{ selectedCollateralIndex: number; networkId: Network }>
        ) => {
            state.payment = {
                ...state.payment,
                selectedCollateralIndex: action.payload.selectedCollateralIndex,
                networkId: action.payload.networkId,
            };
            localStore.set(
                `${LOCAL_STORAGE_KEYS.COLLATERAL_INDEX}${state.payment.networkId}`,
                state.payment.selectedCollateralIndex
            );
        },
        setPaymentIsVoucherSelected: (state, action: PayloadAction<boolean>) => {
            state.payment = { ...state.payment, isVoucherSelected: action.payload };
        },
        setPaymentIsVoucherAvailable: (state, action: PayloadAction<boolean>) => {
            state.payment = { ...state.payment, isVoucherAvailable: action.payload };
        },
        setPaymentAmountToBuy: (state, action: PayloadAction<number | string>) => {
            state.payment = { ...state.payment, amountToBuy: action.payload };
        },
        setIsMultiSingle: (state, action: PayloadAction<boolean>) => {
            state.isMultiSingle = action.payload;
        },
        resetTicketError: (state) => {
            state.error = getDefaultError();
        },
    },
});

export const {
    updateTicket,
    removeFromTicket,
    removeAll,
    setPayment,
    setPaymentSelectedCollateralIndex,
    setPaymentIsVoucherSelected,
    setPaymentIsVoucherAvailable,
    setPaymentAmountToBuy,
    resetTicketError,
    setMaxTicketSize,
    setIsMultiSingle,
} = ticketSlice.actions;

const getTicketState = (state: RootState) => state[sliceName];
export const getTicket = (state: RootState) => getTicketState(state).ticket;
export const getTicketPayment = (state: RootState) => getTicketState(state).payment;
export const getMaxTicketSize = (state: RootState) => getTicketState(state).maxTicketSize;
export const getIsMultiSingle = (state: RootState) => getTicketState(state).isMultiSingle;
export const getTicketError = (state: RootState) => getTicketState(state).error;
export const getHasTicketError = createSelector(getTicketError, (error) => error.code != ParlayErrorCode.NO_ERROS);

export default ticketSlice.reducer;
