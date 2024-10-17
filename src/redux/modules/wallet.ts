import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { DEFAULT_NETWORK } from 'constants/network';
import { RootState } from 'redux/rootReducer';
import { getAddress } from 'thales-utils';
import { SupportedNetwork } from 'types/network';

const sliceName = 'wallet';

type WalletSliceState = {
    walletAddress: string | null;
    isBiconomy?: boolean;
    isAA: boolean;
    connectedViaParticle: boolean;
    networkId: SupportedNetwork;
    networkName: string;
    switchToNetworkId: SupportedNetwork; // used to trigger manually network switch in App.js
    walletConnectModal: {
        visibility: boolean;
        origin?: 'sign-up' | 'sign-in' | undefined;
    };
};

const initialState: WalletSliceState = {
    walletAddress: null,
    isAA: false,
    isBiconomy: false,
    connectedViaParticle: false,
    networkId: DEFAULT_NETWORK.networkId,
    networkName: DEFAULT_NETWORK.name,
    switchToNetworkId: DEFAULT_NETWORK.networkId,
    walletConnectModal: {
        visibility: false,
        origin: undefined,
    },
};

const walletDetailsSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        updateWallet: (state, action: PayloadAction<Partial<WalletSliceState>>) => {
            const { payload } = action;
            const newState = {
                ...state,
                ...payload,
                walletAddress: payload.walletAddress ? getAddress(payload.walletAddress) : null,
            };

            return newState;
        },
        updateParticleState: (state, action: PayloadAction<{ connectedViaParticle: boolean }>) => {
            state.connectedViaParticle = action.payload.connectedViaParticle;
        },
        updateNetworkSettings: (
            state,
            action: PayloadAction<{
                networkId: SupportedNetwork;
                networkName: string;
            }>
        ) => {
            const { networkId, networkName } = action.payload;

            state.networkId = networkId;
            state.networkName = networkName;
        },
        switchToNetworkId: (
            state,
            action: PayloadAction<{
                networkId: SupportedNetwork;
            }>
        ) => {
            state.switchToNetworkId = action.payload.networkId;
        },
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
export const getNetworkId = (state: RootState) => getWalletState(state).networkId;
export const getSwitchToNetworkId = (state: RootState) => getWalletState(state).switchToNetworkId;
export const getWalletAddress = (state: RootState) => getWalletState(state).walletAddress;
export const getIsAA = (state: RootState) => getWalletState(state).isAA;
export const getIsConnectedViaParticle = (state: RootState) => getWalletState(state).connectedViaParticle;
export const getWalletConnectModalVisibility = (state: RootState) =>
    getWalletState(state).walletConnectModal.visibility;
export const getWalletConnectModalOrigin = (state: RootState) => getWalletState(state).walletConnectModal.origin;
export const getIsWalletConnected = createSelector(getWalletAddress, (walletAddress) => walletAddress != null);

export const {
    updateNetworkSettings,
    switchToNetworkId,
    updateWallet,
    updateParticleState,
    setWalletConnectModalVisibility,
    setIsBiconomy,
} = walletDetailsSlice.actions;

export default walletDetailsSlice.reducer;
