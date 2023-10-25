import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import {
    CombinedMarketPosition,
    MultiSingleAmounts,
    ParlayPayment,
    ParlaysMarketPosition,
    SGPItem,
} from 'types/markets';
import localStore from 'utils/localStore';
import { RootState } from '../rootReducer';
import { compareCombinedPositionsFromParlayData, getCombinedMarketsFromParlayData } from 'utils/combinedMarkets';
import { fixOneSideMarketCompetitorName } from 'utils/formatters/string';
import { GOLF_TAGS } from 'constants/tags';
import { Network } from 'enums/network';
// import { canPlayerBeAddedToParlay } from 'utils/markets';
import { BetType, CombinedPositionsMatchingCode, ParlayErrorCode, PLAYER_PROPS_BET_TYPES } from 'enums/markets';

const sliceName = 'parlay';

const DEFAULT_MAX_NUMBER_OF_MATCHES = 10;
const MAX_NUMBER_OF_DOUBLE_CHANCES_ON_PARLAY = 10;
const MAX_NUMBER_OF_COMBINED_MARKETS_IN_PARLAY = 10;

const getDefaultParlay = (): ParlaysMarketPosition[] => {
    const lsParlay = localStore.get(LOCAL_STORAGE_KEYS.PARLAY);
    return lsParlay !== undefined ? (lsParlay as ParlaysMarketPosition[]) : [];
};

const getDefaultCombinedPositions = (): CombinedMarketPosition[] => {
    const combinedPositions = localStore.get(LOCAL_STORAGE_KEYS.COMBINED_POSITIONS);
    return combinedPositions !== undefined ? (combinedPositions as CombinedMarketPosition[]) : [];
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

const getDefaultMultiSingle = (): MultiSingleAmounts[] => {
    const multiSinglePositions = localStore.get(LOCAL_STORAGE_KEYS.MULTI_SINGLE);

    return multiSinglePositions !== undefined ? (multiSinglePositions as MultiSingleAmounts[]) : [];
};

const getDefaultIsMultiSingle = () => {
    const lsIsMultiSingle = localStore.get(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE);
    return lsIsMultiSingle !== undefined ? (lsIsMultiSingle as boolean) : false;
};

const getDefaultError = () => {
    return { code: ParlayErrorCode.NO_ERROS, data: '' };
};

type ParlaySliceState = {
    parlay: ParlaysMarketPosition[];
    combinedPositions: CombinedMarketPosition[];
    parlaySize: number;
    payment: ParlayPayment;
    multiSingle: MultiSingleAmounts[];
    isMultiSingle: boolean;
    sgpFees: SGPItem[];
    error: { code: ParlayErrorCode; data: string };
};

const initialState: ParlaySliceState = {
    parlay: getDefaultParlay(),
    combinedPositions: getDefaultCombinedPositions(),
    parlaySize: DEFAULT_MAX_NUMBER_OF_MATCHES,
    payment: getDefaultPayment(),
    multiSingle: getDefaultMultiSingle(),
    isMultiSingle: getDefaultIsMultiSingle(),
    sgpFees: [],
    error: getDefaultError(),
};

const parlaySlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        updateParlay: (state, action: PayloadAction<ParlaysMarketPosition>) => {
            const parlayCopy = [...state.parlay];
            const existingMarketIndex = state.parlay.findIndex(
                (el) =>
                    el.parentMarket === action.payload.parentMarket &&
                    el.sportMarketAddress == action.payload.sportMarketAddress
            );
            const hasAddedSameParentMarket = !!state.parlay.find(
                (market) => market.parentMarket == action.payload.parentMarket
            );
            const numberOfDoubleChances = parlayCopy.filter((market) => market.doubleChanceMarketType !== null).length;

            const multipleSidesAtOneEvent = parlayCopy
                .filter((market) => market.isOneSideMarket)
                .map((market) => market.tag)
                .findIndex((tag) => tag == action.payload.tag);

            const existingGolfPlayerInParlay = parlayCopy
                .filter((market) => GOLF_TAGS.includes(Number(market.tag)))
                .findIndex(
                    (market) =>
                        market.homeTeam == action.payload.homeTeam ||
                        market.homeTeam == action.payload.awayTeam ||
                        market.awayTeam == action.payload.homeTeam ||
                        market.awayTeam == action.payload.awayTeam
                );

            const isIncomingPositionPlayerProps = PLAYER_PROPS_BET_TYPES.includes(action.payload.betType as BetType);

            // Check the case of multiple player props markets from same market
            if (isIncomingPositionPlayerProps && hasAddedSameParentMarket) {
                const existingNonPlayerPropsPosition = state.parlay.findIndex(
                    (market) =>
                        !PLAYER_PROPS_BET_TYPES.includes(market.betType) &&
                        market.parentMarket == action.payload.parentMarket
                );

                const samePlayerNamePlayerProps = state.parlay.findIndex(
                    (market) =>
                        PLAYER_PROPS_BET_TYPES.includes(market.betType) &&
                        market.playerName?.trim().toLowerCase() == action.payload.playerName?.trim().toLowerCase()
                );

                if (samePlayerNamePlayerProps !== -1) {
                    state.error.code = ParlayErrorCode.SAME_PLAYER_SAME_GAME_PLAYER_PROPS;
                    return;
                }

                if (existingNonPlayerPropsPosition !== -1) {
                    // state.parlay = state.parlay.filter((_market, index) => index !== existingNonPlayerPropsPosition);
                    state.error.code = ParlayErrorCode.ADDING_PLAYER_PROPS_ALREADY_HAVE_POSITION_OF_SAME_MARKET;
                    return;
                }
            }

            if (
                action.payload.doubleChanceMarketType !== null &&
                numberOfDoubleChances >= MAX_NUMBER_OF_DOUBLE_CHANCES_ON_PARLAY &&
                (existingMarketIndex === -1 || parlayCopy[existingMarketIndex].doubleChanceMarketType === null)
            ) {
                state.error.code = ParlayErrorCode.MAX_DOUBLE_CHANCES;
                state.error.data = MAX_NUMBER_OF_DOUBLE_CHANCES_ON_PARLAY.toString();
            } else if (multipleSidesAtOneEvent !== -1) {
                const existingSide = parlayCopy
                    .filter((market) => market.isOneSideMarket)
                    .map((market) => market.homeTeam)[multipleSidesAtOneEvent];

                state.error.code = ParlayErrorCode.SAME_EVENT_PARTICIPANT;
                state.error.data =
                    fixOneSideMarketCompetitorName(existingSide) +
                    '/' +
                    fixOneSideMarketCompetitorName(action.payload.homeTeam);
            } else if (existingGolfPlayerInParlay != -1) {
                const existingHomeSide = parlayCopy
                    .filter((market) => GOLF_TAGS.includes(Number(market.tag)))
                    .map((market) => market.homeTeam)[existingGolfPlayerInParlay];

                const existingAwaySide = parlayCopy
                    .filter((market) => GOLF_TAGS.includes(Number(market.tag)))
                    .map((market) => market.awayTeam)[existingGolfPlayerInParlay];

                const existingSides =
                    action.payload.homeTeam == existingHomeSide
                        ? existingHomeSide
                        : action.payload.homeTeam == existingAwaySide
                        ? existingAwaySide
                        : action.payload.awayTeam == existingHomeSide
                        ? existingHomeSide
                        : existingAwaySide;

                state.error.code = ParlayErrorCode.UNIQUE_TOURNAMENT_PLAYERS;
                state.error.data = fixOneSideMarketCompetitorName(existingSides);
            } else if (existingMarketIndex === -1) {
                // ADD new market
                if (state.parlay.length < state.parlaySize) {
                    const parlayTeamsByLeague = parlayCopy
                        .filter((market) => market.tags[0] === action.payload.tags[0])
                        .map((market) => [market.homeTeam, market.awayTeam])
                        .flat();

                    const homeTeamInParlay = parlayTeamsByLeague.filter((team) => team === action.payload.homeTeam)[0];
                    const awayTeamInParlay = parlayTeamsByLeague.filter((team) => team === action.payload.awayTeam)[0];

                    if ((homeTeamInParlay || awayTeamInParlay) && !isIncomingPositionPlayerProps) {
                        state.error.code = ParlayErrorCode.SAME_TEAM_TWICE;
                        state.error.data = homeTeamInParlay ? homeTeamInParlay : awayTeamInParlay;
                    } else {
                        state.multiSingle.push({
                            sportMarketAddress: action.payload.sportMarketAddress,
                            parentMarketAddress: action.payload.parentMarket,
                            amountToBuy: '',
                        });
                        state.parlay.push(action.payload);
                    }
                } else {
                    state.error.code = ParlayErrorCode.MAX_MATCHES;
                    state.error.data = state.parlaySize.toString();
                }
                //  else if (state.parlay.length < state.parlaySize) {
                //         state.multiSingle.push({
                //             sportMarketAddress: action.payload.sportMarketAddress,
                //             parentMarketAddress: action.payload.parentMarket,
                //             amountToBuy: 0,
                //         });
                //         state.parlay.push(action.payload);
                //     } else {
                //         state.error.code = ParlayErrorCode.MAX_MATCHES;
                //         state.error.data = state.parlaySize.toString();
                //     }
                // }
            } else {
                // UPDATE market position
                parlayCopy[existingMarketIndex] = action.payload;
                state.parlay = [...parlayCopy];

                // reset multiSingle if position is changed
                const multiSingleCopy = [...state.multiSingle];
                multiSingleCopy[existingMarketIndex].sportMarketAddress = action.payload.sportMarketAddress;
                multiSingleCopy[existingMarketIndex].amountToBuy = 0;
                state.multiSingle = [...multiSingleCopy];
            }

            //  else if (action.payload.playerId && canPlayerBeAddedToParlay(state.parlay, action.payload)) {

            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
        },
        updateParlayWithMultiplePositions: (state, action: PayloadAction<ParlaysMarketPosition[]>) => {
            const combinedMarkets = getCombinedMarketsFromParlayData(state.parlay);
            const incomingCombinedMarkets = getCombinedMarketsFromParlayData(action.payload);

            if (incomingCombinedMarkets.length && Math.round(combinedMarkets.length / 2) == 4) {
                state.error.code = ParlayErrorCode.MAX_COMBINED_MARKETS;
                state.error.data = MAX_NUMBER_OF_COMBINED_MARKETS_IN_PARLAY.toString();
                return;
            }

            if (state.parlay.length + action.payload.length > state.parlaySize) {
                state.error.code = ParlayErrorCode.MAX_MATCHES;
                state.error.data = state.parlaySize.toString();
                return;
            }

            if (state.multiSingle.length == 0) {
                localStore.set(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE, false);
            }

            state.parlay.push(...action.payload);
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
        },
        updateCombinedPositions: (state, action: PayloadAction<CombinedMarketPosition>) => {
            const existingCombinedPositions = state.combinedPositions;

            let matchingCode: CombinedPositionsMatchingCode = CombinedPositionsMatchingCode.NOTHING_COMMON;

            if (existingCombinedPositions.length > 0) {
                existingCombinedPositions.forEach((positions: CombinedMarketPosition, index: number) => {
                    const comparePositions = compareCombinedPositionsFromParlayData(positions, action.payload);
                    matchingCode = comparePositions;
                    if (comparePositions == CombinedPositionsMatchingCode.SAME_POSITIONS) {
                        return;
                    }
                    if (
                        comparePositions == CombinedPositionsMatchingCode.SAME_MARKET_ADDRESSES_NOT_POSITIONS ||
                        comparePositions == CombinedPositionsMatchingCode.SAME_PARENT_MARKET
                    ) {
                        delete existingCombinedPositions[index];
                        existingCombinedPositions[index] = action.payload;
                        return;
                    }
                    return;
                });
            }

            if (existingCombinedPositions.length == 0 || matchingCode == CombinedPositionsMatchingCode.NOTHING_COMMON) {
                existingCombinedPositions.push(action.payload);
            }

            if (state.combinedPositions.length * 2 + state.parlay.length > 10) {
                state.error.code = ParlayErrorCode.MAX_COMBINED_MARKETS;
                state.error.data = MAX_NUMBER_OF_COMBINED_MARKETS_IN_PARLAY.toString();
                return;
            }

            //Multisingle amounts
            const marketAddressesArr = action.payload.markets.map((market) => market.sportMarketAddress);
            const parentAddressesArr = action.payload.markets.map((market) => market.parentMarket);
            const index = state.multiSingle.findIndex((el) => el.sportMarketAddress === marketAddressesArr.join('-'));

            if (index === -1) {
                state.multiSingle.push({
                    sportMarketAddress: marketAddressesArr.join('-'),
                    parentMarketAddress: parentAddressesArr.join('-'),
                    amountToBuy: 0,
                });
            } else {
                const multiSingleCopy = [...state.multiSingle];
                multiSingleCopy[index].sportMarketAddress = marketAddressesArr.join('-');
                multiSingleCopy[index].parentMarketAddress = parentAddressesArr.join('-');
                multiSingleCopy[index].amountToBuy = 0;
                state.multiSingle = [...multiSingleCopy];
            }

            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
            localStore.set(LOCAL_STORAGE_KEYS.COMBINED_POSITIONS, existingCombinedPositions);
        },
        removeCombinedPosition: (state, action: PayloadAction<string>) => {
            state.combinedPositions = state.combinedPositions.filter((positions) =>
                positions.markets.find(
                    (market) => market.parentMarket == action.payload && market.sportMarketAddress == action.payload
                )
                    ? false
                    : true
            );

            state.multiSingle = state.multiSingle.filter(
                (ms) =>
                    !ms.sportMarketAddress.includes(action.payload) && !ms.parentMarketAddress.includes(action.payload)
            );

            state.parlay = state.parlay.filter(
                (market) => market.sportMarketAddress !== action.payload && market.parentMarket !== action.payload
            );

            if (state.multiSingle.length == 0) {
                state.isMultiSingle = false;
                localStore.set(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE, state.isMultiSingle);
            }

            if (state.parlay.length === 0) {
                state.payment.amountToBuy = getDefaultPayment().amountToBuy;
            }

            localStore.set(LOCAL_STORAGE_KEYS.COMBINED_POSITIONS, state.combinedPositions);
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
        },
        setParlaySize: (state, action: PayloadAction<number>) => {
            state.parlaySize = action.payload;
        },
        removeFromParlay: (state, action: PayloadAction<string>) => {
            state.parlay = state.parlay.filter(
                (market) => market.sportMarketAddress !== action.payload && market.parentMarket !== action.payload
            );
            state.multiSingle = state.multiSingle.filter((ms) => ms.sportMarketAddress !== action.payload);

            if (state.multiSingle.length == 0) {
                state.isMultiSingle = false;
                localStore.set(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE, state.isMultiSingle);
            }

            if (state.parlay.length === 0) {
                state.payment.amountToBuy = getDefaultPayment().amountToBuy;
            }
            state.error = getDefaultError();
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
        },
        removeCombinedMarketFromParlay: (state, action: PayloadAction<string>) => {
            state.parlay = state.parlay.filter((market) => market.parentMarket !== action.payload);
            state.multiSingle = state.multiSingle.filter(
                (ms) => ms.sportMarketAddress !== action.payload && ms.parentMarketAddress !== action.payload
            );

            if (state.multiSingle.length == 0) {
                localStore.set(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE, false);
            }

            if (state.parlay.length === 0) {
                state.payment.amountToBuy = getDefaultPayment().amountToBuy;
            }
            state.error = getDefaultError();
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
        },
        removeAll: (state) => {
            state.parlay = [];
            state.combinedPositions = [];
            state.payment.amountToBuy = getDefaultPayment().amountToBuy;
            state.multiSingle = [];
            state.error = getDefaultError();
            localStore.set(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE, false);
            localStore.set(LOCAL_STORAGE_KEYS.PARLAY, state.parlay);
            localStore.set(LOCAL_STORAGE_KEYS.COMBINED_POSITIONS, state.combinedPositions);
            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
        },
        setPayment: (state, action: PayloadAction<ParlayPayment>) => {
            state.payment = { ...state.payment, ...action.payload };

            // Store the users last selected stable index
            localStore.set(
                `${LOCAL_STORAGE_KEYS.COLLATERAL_INDEX}${state.payment.networkId}`,
                state.payment.selectedCollateralIndex
            );
        },
        setIsMultiSingle: (state, action: PayloadAction<boolean>) => {
            state.isMultiSingle = action.payload;
            localStore.set(LOCAL_STORAGE_KEYS.IS_MULTI_SINGLE, state.isMultiSingle);
        },
        setMultiSingle: (state, action: PayloadAction<MultiSingleAmounts>) => {
            const index = state.multiSingle.findIndex(
                (el) => el.sportMarketAddress === action.payload.sportMarketAddress
            );
            if (index === -1) {
                state.multiSingle.push(action.payload);
            } else {
                const multiSingleCopy = [...state.multiSingle];
                multiSingleCopy[index].sportMarketAddress = action.payload.sportMarketAddress;
                multiSingleCopy[index].amountToBuy = action.payload.amountToBuy;
                state.multiSingle = [...multiSingleCopy];
            }
            localStore.set(LOCAL_STORAGE_KEYS.MULTI_SINGLE, state.multiSingle);
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
        resetParlayError: (state) => {
            state.error = getDefaultError();
        },
        setSGPFees: (state, action: PayloadAction<SGPItem[]>) => {
            state.sgpFees = [...action.payload];
            localStore.set(LOCAL_STORAGE_KEYS.SGP_FEES, state.sgpFees);
        },
    },
});

export const {
    updateParlay,
    updateParlayWithMultiplePositions,
    updateCombinedPositions,
    removeCombinedPosition,
    setParlaySize,
    removeFromParlay,
    removeCombinedMarketFromParlay,
    removeAll,
    setPayment,
    setMultiSingle,
    setIsMultiSingle,
    setPaymentSelectedCollateralIndex,
    setPaymentIsVoucherSelected,
    setPaymentIsVoucherAvailable,
    setPaymentAmountToBuy,
    resetParlayError,
    setSGPFees,
} = parlaySlice.actions;

const getParlayState = (state: RootState) => state[sliceName];
export const getParlay = (state: RootState) => getParlayState(state).parlay;
export const getMultiSingle = (state: RootState) => getParlayState(state).multiSingle;
export const getCombinedPositions = (state: RootState) => getParlayState(state).combinedPositions;
export const getIsMultiSingle = (state: RootState) => getParlayState(state).isMultiSingle;
export const getParlaySize = (state: RootState) => getParlayState(state).parlaySize;
export const getParlayPayment = (state: RootState) => getParlayState(state).payment;
export const getParlayError = (state: RootState) => getParlayState(state).error;
export const getHasParlayError = createSelector(getParlayError, (error) => error.code != ParlayErrorCode.NO_ERROS);

export default parlaySlice.reducer;
