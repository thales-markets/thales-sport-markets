import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { getAddress } from 'utils/formatters/ethers';
import { NetworkNameById } from 'utils/network';
import { RootState } from 'redux/rootReducer';
import { NetworkId } from 'types/network';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { PrimeSdk } from '@etherspot/prime-sdk';

const sliceName = 'wallet';

export type WalletSliceState = {
    walletAddress: string | null;
    networkId: NetworkId;
    networkName: string;
    switchToNetworkId: NetworkId; // used to trigger manually network switch in App.js
    isSocialLogin: boolean;
    primeSdk: PrimeSdk | null;
};

const initialState: WalletSliceState = {
    walletAddress: null,
    networkId: DEFAULT_NETWORK_ID,
    networkName: NetworkNameById[DEFAULT_NETWORK_ID],
    switchToNetworkId: DEFAULT_NETWORK_ID,
    isSocialLogin: false,
    primeSdk: null,
};

export const walletDetailsSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        resetWallet: () => {
            return initialState;
        },
        updateWallet: (state, action: PayloadAction<Partial<WalletSliceState>>) => {
            const { payload } = action;
            const newState = {
                ...state,
                ...payload,
                walletAddress: payload.walletAddress ? getAddress(payload.walletAddress) : null,
            };

            return newState;
        },
        updateNetworkSettings: (
            state,
            action: PayloadAction<{
                networkId: NetworkId;
            }>
        ) => {
            const { networkId } = action.payload;

            state.networkId = networkId;
            state.networkName = NetworkNameById[networkId]?.toLowerCase();
        },
        switchToNetworkId: (
            state,
            action: PayloadAction<{
                networkId: NetworkId;
            }>
        ) => {
            state.switchToNetworkId = action.payload.networkId;
        },
        updateIsSocialLogin: (state, action: PayloadAction<boolean>) => {
            state.isSocialLogin = action.payload;
        },
        updatePrimeSdk: (state, action: PayloadAction<PrimeSdk | null>) => {
            state.primeSdk = action.payload;
        },
    },
});

export const getWalletState = (state: RootState) => state[sliceName];
export const getNetworkId = (state: RootState) => getWalletState(state).networkId;
export const getNetworkName = (state: RootState) => getWalletState(state).networkName;
export const getNetwork = (state: RootState) => ({
    networkId: getNetworkId(state),
    networkName: getNetworkName(state),
});
export const getSwitchToNetworkId = (state: RootState) => getWalletState(state).switchToNetworkId;
export const getWalletAddress = (state: RootState) => getWalletState(state).walletAddress;
export const getIsWalletConnected = createSelector(getWalletAddress, (walletAddress) => walletAddress != null);
export const getWalletInfo = (state: RootState) => getWalletState(state);
export const getIsSocialLogin = (state: RootState) => getWalletState(state).isSocialLogin;
export const getPrimeSdk = (state: RootState) => getWalletState(state).primeSdk;

export const {
    updateNetworkSettings,
    switchToNetworkId,
    resetWallet,
    updateWallet,
    updateIsSocialLogin,
    updatePrimeSdk,
} = walletDetailsSlice.actions;

export default walletDetailsSlice.reducer;
