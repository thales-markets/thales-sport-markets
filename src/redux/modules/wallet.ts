import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState, WalletSliceState } from 'types/redux';

const sliceName = 'wallet';

const initialState: WalletSliceState = {
    isBiconomy: false,
    connectedViaParticle: false,
    walletConnectModal: {
        visibility: false,
        origin: undefined,
    },
};

const walletDetailsSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setWalletConnectModalVisibility: (
            state,
            action: PayloadAction<{ visibility: boolean; origin?: 'sign-up' | 'sign-in' | undefined }>
        ) => {
            state.walletConnectModal.visibility = action.payload.visibility;
            state.walletConnectModal.origin = action.payload.origin;
        },
        setIsBiconomy: (state, action: PayloadAction<boolean>) => {
            state.isBiconomy = action.payload;
        },
    },
});

const getWalletState = (state: RootState) => state[sliceName];
export const getIsBiconomy = (state: RootState) => getWalletState(state).isBiconomy;
export const getIsConnectedViaParticle = (state: RootState) => getWalletState(state).connectedViaParticle;
export const getWalletConnectModalVisibility = (state: RootState) =>
    getWalletState(state).walletConnectModal.visibility;
export const getWalletConnectModalOrigin = (state: RootState) => getWalletState(state).walletConnectModal.origin;

export const { setWalletConnectModalVisibility, setIsBiconomy } = walletDetailsSlice.actions;

export default walletDetailsSlice.reducer;
