import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { localStore } from 'thales-utils';
import { RootState, WalletSliceState } from 'types/redux';

const sliceName = 'wallet';

const initialState: WalletSliceState = {
    isSmartAccountDisabled: false,
    isBiconomy: localStore.get(LOCAL_STORAGE_KEYS.USE_BICONOMY) ?? true,
    connectedViaParticle: false,
    walletConnectModal: {
        visibility: false,
    },
};

const walletDetailsSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setWalletConnectModalVisibility: (state, action: PayloadAction<{ visibility: boolean }>) => {
            state.walletConnectModal.visibility = action.payload.visibility;
        },
        setIsBiconomy: (state, action: PayloadAction<boolean>) => {
            state.isBiconomy = action.payload;
        },
        setIsSmartAccountDisabled: (state, action: PayloadAction<boolean>) => {
            state.isSmartAccountDisabled = action.payload;
        },
        updateParticleState: (state, action: PayloadAction<{ connectedViaParticle: boolean }>) => {
            state.connectedViaParticle = action.payload.connectedViaParticle;
        },
    },
});

const getWalletState = (state: RootState) => state[sliceName];
export const getIsBiconomy = (state: RootState) => getWalletState(state).isBiconomy;
export const getIsConnectedViaParticle = (state: RootState) => getWalletState(state).connectedViaParticle;
export const getWalletConnectModalVisibility = (state: RootState) =>
    getWalletState(state).walletConnectModal.visibility;
export const getIsSmartAccountDisabled = (state: RootState) => getWalletState(state).isSmartAccountDisabled;

export const {
    setWalletConnectModalVisibility,
    setIsBiconomy,
    updateParticleState,
    setIsSmartAccountDisabled,
} = walletDetailsSlice.actions;

export default walletDetailsSlice.reducer;
