import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SGP_BET_MAX_MARKETS } from 'constants/markets';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { TicketErrorCode } from 'enums/markets';
import { Network } from 'enums/network';
import { WritableDraft } from 'immer/dist/internal';
import { isFuturesMarket, isPlayerPropsMarket } from 'overtime-utils';
import { localStore } from 'thales-utils';
import { ParlayPayment, SerializableSportMarket, TicketPosition } from 'types/markets';
import { RootState, TicketSliceState } from 'types/redux';
import { TicketError } from 'types/tickets';
import {
    isPlayerPropsCombiningEnabled,
    isSameMarket,
    serializableSportMarketAsSportMarket,
} from '../../utils/marketsV2';

const sliceName = 'ticket';

const DEFAULT_MAX_TICKET_SIZE = 10;

const getDefaultTicket = (): TicketPosition[] => {
    const lsParlay = localStore.get(LOCAL_STORAGE_KEYS.PARLAY);
    return lsParlay !== undefined ? (lsParlay as TicketPosition[]) : [];
};

const getDefaultPayment = (): ParlayPayment => {
    const lsForceCollateralChange = localStore.get(LOCAL_STORAGE_KEYS.COLLATERAL_CHANGED);

    return {
        selectedCollateralIndex: 0,
        amountToBuy: '',
        networkId: Network.OptimismMainnet,
        forceChangeCollateral: lsForceCollateralChange !== undefined ? (lsForceCollateralChange as boolean) : false,
    };
};

const getDefaultLiveSlippage = (): number => {
    const slippage = localStore.get<number>(LOCAL_STORAGE_KEYS.LIVE_BET_SLIPPAGE);
    return slippage !== undefined ? slippage : 1;
};

const getDefaultIsSystemBet = (): boolean => {
    const lsIsSystemBet = localStore.get(LOCAL_STORAGE_KEYS.IS_SYSTEM_BET);
    return lsIsSystemBet !== undefined ? (lsIsSystemBet as boolean) : false;
};

const getDefaultIsSgp = (): boolean => {
    const lsIsSgp = localStore.get(LOCAL_STORAGE_KEYS.IS_SGP);
    return lsIsSgp !== undefined ? (lsIsSgp as boolean) : false;
};

const getDefaultError = (): TicketError => {
    return { code: TicketErrorCode.NO_ERROS, data: '' };
};

const initialState: TicketSliceState = {
    ticket: getDefaultTicket(),
    payment: getDefaultPayment(),
    maxTicketSize: DEFAULT_MAX_TICKET_SIZE,
    liveBetSlippage: getDefaultLiveSlippage(),
    isFreeBetDisabledByUser: false,
    isSystemBet: getDefaultIsSystemBet(),
    isSgp: getDefaultIsSgp(),
    error: getDefaultError(),
};

const _removeAll = (state: WritableDraft<TicketSliceState>) => {
    state.ticket = [];
    state.payment.amountToBuy = getDefaultPayment().amountToBuy;
    state.error = getDefaultError();
    localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.ticket);
};

const ticketSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        updateTicket: (state, action: PayloadAction<TicketPosition>) => {
            const ticketCopy = [...state.ticket];
            const existingGameIdIndex = state.ticket.findIndex((el) => el.gameId === action.payload.gameId);

            // UPDATE market position
            if (action.payload.live) {
                state.ticket = [action.payload];
            } else if (state.isSgp && state.ticket.length) {
                if (state.ticket.length < SGP_BET_MAX_MARKETS) {
                    const isDifferentGame = state.ticket[0].gameId !== action.payload.gameId;
                    if (isDifferentGame) {
                        state.error.code = TicketErrorCode.SGP_DIFFERENT_GAME;
                    } else {
                        const existingPositionIndex = state.ticket.findIndex((el) =>
                            isSameMarket(el, action.payload, true)
                        );
                        if (existingPositionIndex === -1) {
                            state.ticket.push(action.payload);
                        } else {
                            ticketCopy[existingPositionIndex] = action.payload;
                            state.ticket = [...ticketCopy];
                        }
                    }
                } else {
                    state.error.code = TicketErrorCode.SGP_MAX_MARKETS;
                    state.error.data = SGP_BET_MAX_MARKETS.toString();
                }
            } else if (existingGameIdIndex === -1) {
                if (state.ticket.length < state.maxTicketSize) {
                    if (
                        state.ticket.length > 0 &&
                        (isFuturesMarket(action.payload.typeId) ||
                            state.ticket.some((position) => isFuturesMarket(position.typeId)))
                    ) {
                        state.error.code = TicketErrorCode.FUTURES_COMBINING_NOT_SUPPORTED;
                    } else {
                        state.ticket.push(action.payload);
                    }
                } else {
                    state.error.code = TicketErrorCode.MAX_MATCHES;
                    state.error.data = state.maxTicketSize.toString();
                }
            } else {
                const existingPosition = state.ticket[existingGameIdIndex];
                const isExistingPositionPP = isPlayerPropsMarket(existingPosition.typeId);
                const isNewPositionPP = isPlayerPropsMarket(action.payload.typeId);

                // it is not supported to combine player props with other types from the same game (if player props combining enabled)
                if (
                    ((isExistingPositionPP && !isNewPositionPP) || (!isExistingPositionPP && isNewPositionPP)) &&
                    isPlayerPropsCombiningEnabled(action.payload.leagueId)
                ) {
                    state.error.code = TicketErrorCode.OTHER_TYPES_WITH_PLAYER_PROPS;
                } else if (
                    isExistingPositionPP &&
                    isNewPositionPP &&
                    isPlayerPropsCombiningEnabled(action.payload.leagueId)
                ) {
                    const playerAlreadyOnTicketIndex = state.ticket.findIndex(
                        (el) => el.playerId === action.payload.playerId && action.payload.playerId > 0
                    );

                    if (playerAlreadyOnTicketIndex > -1) {
                        // it is not supported to combine different categories for the same player
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
                            // the maximum number of positions on the ticket exceeded
                            state.error.code = TicketErrorCode.MAX_MATCHES;
                            state.error.data = state.maxTicketSize.toString();
                        }
                    }
                } else {
                    ticketCopy[existingGameIdIndex] = action.payload;
                    state.ticket = [...ticketCopy];
                }
            }

            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.ticket);
        },
        setMaxTicketSize: (state, action: PayloadAction<number>) => {
            state.maxTicketSize = action.payload;
        },
        removeFromTicket: (state, action: PayloadAction<SerializableSportMarket | TicketPosition>) => {
            let payload;
            if (action.payload.hasOwnProperty('maturity')) {
                payload = serializableSportMarketAsSportMarket(action.payload as SerializableSportMarket);
            } else {
                payload = action.payload as TicketPosition;
            }

            state.ticket = state.ticket.filter((market) => !isSameMarket(payload, market, state.isSgp));

            if (state.ticket.length === 0) {
                state.payment.amountToBuy = getDefaultPayment().amountToBuy;
            }
            state.error = getDefaultError();
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.ticket);
        },
        removeAll: (state) => {
            _removeAll(state);
        },
        setLiveBetSlippage: (state, action: PayloadAction<number>) => {
            state.liveBetSlippage = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.LIVE_BET_SLIPPAGE, action.payload);
        },
        setPaymentSelectedCollateralIndex: (
            state,
            action: PayloadAction<{ selectedCollateralIndex: number; networkId: Network; forcedChange?: boolean }>
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
            if (action.payload.forcedChange) {
                state.payment.forceChangeCollateral = true;
                localStore.set(LOCAL_STORAGE_KEYS.COLLATERAL_CHANGED, true);
            }
        },
        setPaymentAmountToBuy: (state, action: PayloadAction<number | string>) => {
            state.payment = { ...state.payment, amountToBuy: action.payload };
        },
        setIsFreeBetDisabledByUser: (state, action: PayloadAction<boolean>) => {
            state.isFreeBetDisabledByUser = action.payload;
        },
        setIsSystemBet: (state, action: PayloadAction<boolean>) => {
            state.isSystemBet = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.IS_SYSTEM_BET, action.payload);
        },
        setIsSgp: (state, action: PayloadAction<boolean>) => {
            if (state.isSgp && state.ticket.length > 1) {
                const firstTicketGameId = state.ticket[0].gameId;
                const isDifferentGame = state.ticket.some((ticket) => ticket.gameId !== firstTicketGameId);
                isDifferentGame && _removeAll(state);
            }
            state.isSgp = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.IS_SGP, action.payload);
        },
        setTicketError: (state, action: PayloadAction<TicketError>) => {
            state.error = action.payload;
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
    setMaxTicketSize,
    setLiveBetSlippage,
    setIsFreeBetDisabledByUser,
    setIsSystemBet,
    setIsSgp,
    setTicketError,
    resetTicketError,
} = ticketSlice.actions;

const getTicketState = (state: RootState) => state[sliceName];
export const getTicket = (state: RootState) => getTicketState(state).ticket;
export const getMaxTicketSize = (state: RootState) => getTicketState(state).maxTicketSize;
export const getTicketPayment = (state: RootState) => getTicketState(state).payment;
export const getLiveBetSlippage = (state: RootState) => getTicketState(state).liveBetSlippage;
export const getIsFreeBetDisabledByUser = (state: RootState) => getTicketState(state).isFreeBetDisabledByUser;
export const getIsSystemBet = (state: RootState) => getTicketState(state).isSystemBet;
export const getIsSgp = (state: RootState) => getTicketState(state).isSgp;
export const getTicketError = (state: RootState) => getTicketState(state).error;
export const getHasTicketError = createSelector(getTicketError, (error) => error.code != TicketErrorCode.NO_ERROS);

export default ticketSlice.reducer;
