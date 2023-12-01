import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { DEFAULT_NETWORK } from 'constants/network';
import { Network } from 'enums/network';
import { RootState } from 'redux/rootReducer';
import { getAddress } from 'utils/formatters/ethers';

const sliceName = 'wallet';

type WalletSliceState = {
    walletAddress: string | null;
    isAA: boolean;
    networkId: Network;
    networkName: string;
    switchToNetworkId: Network; // used to trigger manually network switch in App.js
    walletConnectModal: {
        visibility: boolean;
        origin?: 'sign-up' | 'sign-in' | undefined;
    };
};

const initialState: WalletSliceState = {
    walletAddress: null,
    isAA: false,
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
        updateNetworkSettings: (
            state,
            action: PayloadAction<{
                networkId: Network;
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
                networkId: Network;
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
    },
});

const getWalletState = (state: RootState) => state[sliceName];
export const getNetworkId = (state: RootState) => getWalletState(state).networkId;
export const getSwitchToNetworkId = (state: RootState) => getWalletState(state).switchToNetworkId;
export const getWalletAddress = (state: RootState) => getWalletState(state).walletAddress;
export const getIsAA = (state: RootState) => getWalletState(state).isAA;
export const getWalletConnectModalVisibility = (state: RootState) =>
    getWalletState(state).walletConnectModal.visibility;
export const getWalletConnectModalOrigin = (state: RootState) => getWalletState(state).walletConnectModal.origin;
export const getIsWalletConnected = createSelector(getWalletAddress, (walletAddress) => walletAddress != null);

export const {
    updateNetworkSettings,
    switchToNetworkId,
    updateWallet,
    setWalletConnectModalVisibility,
} = walletDetailsSlice.actions;

export default walletDetailsSlice.reducer;
