import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { TicketErrorCode } from 'enums/markets';
import { Network } from 'enums/network';
import { localStore } from 'thales-utils';
import { ParlayPayment, SportMarket, TicketPosition } from 'types/markets';
import { isPlayerPropsMarket } from '../../utils/markets';
import { isSameMarket } from '../../utils/marketsV2';
import { getLeagueLabel, isPlayerPropsCombiningEnabled } from '../../utils/sports';
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
        amountToBuy: '',
        networkId: Network.OptimismMainnet,
    };
};

const getDefaultLiveSlippage = (): number => {
    const slippage = localStore.get<number>(LOCAL_STORAGE_KEYS.LIVE_BET_SLIPPAGE);
    return slippage !== undefined ? slippage : 1;
};

const getDefaultError = () => {
    return { code: TicketErrorCode.NO_ERROS, data: '' };
};

type TicketSliceState = {
    ticket: TicketPosition[];
    payment: ParlayPayment;
    maxTicketSize: number;
    isMultiSingle: boolean;
    liveBetSlippage: number;
    error: { code: TicketErrorCode; data: string };
};

const initialState: TicketSliceState = {
    ticket: getDefaultTicket(),
    payment: getDefaultPayment(),
    maxTicketSize: DEFAULT_MAX_TICKET_SIZE,
    isMultiSingle: false,
    error: getDefaultError(),
    liveBetSlippage: getDefaultLiveSlippage(),
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
                if (state.ticket.length < state.maxTicketSize) {
                    state.ticket.push(action.payload);
                } else {
                    state.error.code = TicketErrorCode.MAX_MATCHES;
                    state.error.data = state.maxTicketSize.toString();
                }
            } else {
                const existingPosition = state.ticket[existingPositionIndex];
                const isExistingPositionPP = isPlayerPropsMarket(existingPosition.typeId);
                const isNewPositionPP = isPlayerPropsMarket(action.payload.typeId);

                if ((isExistingPositionPP && !isNewPositionPP) || (!isExistingPositionPP && isNewPositionPP)) {
                    state.error.code = TicketErrorCode.OTHER_TYPES_WITH_PLAYER_PROPS;
                } else if (isExistingPositionPP && isNewPositionPP) {
                    const playerAlreadyOnTicketIndex = state.ticket.findIndex(
                        (el) => el.playerId === action.payload.playerId && action.payload.playerId > 0
                    );

                    if (!isPlayerPropsCombiningEnabled(action.payload.leagueId)) {
                        state.error.code = TicketErrorCode.PLAYER_PROPS_COMBINING_NOT_ENABLED;
                        state.error.data = getLeagueLabel(action.payload.leagueId);
                    } else if (playerAlreadyOnTicketIndex > -1) {
                        if (state.ticket[playerAlreadyOnTicketIndex].typeId !== action.payload.typeId) {
                            state.error.code = TicketErrorCode.SAME_PLAYER_DIFFERENT_TYPES;
                            state.error.data = action.payload.playerName;
                        } else {
                            ticketCopy[playerAlreadyOnTicketIndex] = action.payload;
                            state.ticket = [...ticketCopy];
                        }
                    } else {
                        if (state.ticket.length < state.maxTicketSize) {
                            state.ticket.push(action.payload);
                        } else {
                            state.error.code = TicketErrorCode.MAX_MATCHES;
                            state.error.data = state.maxTicketSize.toString();
                        }
                    }
                } else {
                    ticketCopy[existingPositionIndex] = action.payload;
                    state.ticket = [...ticketCopy];
                }
            }

            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.ticket);
        },
        setMaxTicketSize: (state, action: PayloadAction<number>) => {
            state.maxTicketSize = action.payload;
        },
        removeFromTicket: (state, action: PayloadAction<SportMarket>) => {
            state.ticket = state.ticket.filter((market) => !isSameMarket(action.payload, market));

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
        setLiveBetSlippage: (state, action: PayloadAction<number>) => {
            state.liveBetSlippage = action.payload;

            localStore.set(LOCAL_STORAGE_KEYS.LIVE_BET_SLIPPAGE, action.payload);
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
        setPaymentAmountToBuy: (state, action: PayloadAction<number | string>) => {
            state.payment = { ...state.payment, amountToBuy: action.payload };
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
    setPaymentSelectedCollateralIndex,
    setPaymentAmountToBuy,
    resetTicketError,
    setMaxTicketSize,
    setLiveBetSlippage,
} = ticketSlice.actions;

const getTicketState = (state: RootState) => state[sliceName];
export const getTicket = (state: RootState) => getTicketState(state).ticket;
export const getTicketPayment = (state: RootState) => getTicketState(state).payment;
export const getLiveBetSlippage = (state: RootState) => getTicketState(state).liveBetSlippage;
export const getTicketError = (state: RootState) => getTicketState(state).error;
export const getHasTicketError = createSelector(getTicketError, (error) => error.code != TicketErrorCode.NO_ERROS);

export default ticketSlice.reducer;