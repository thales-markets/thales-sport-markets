import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { getAddress } from 'utils/formatters/ethers';
import { RootState } from 'redux/rootReducer';
import { Network } from 'enums/network';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { NetworkNameById } from 'constants/network';

const sliceName = 'wallet';

type WalletSliceState = {
    walletAddress: string | null;
    networkId: Network;
    networkName: string;
    switchToNetworkId: Network; // used to trigger manually network switch in App.js
    isSocialLogin: boolean;
};

const initialState: WalletSliceState = {
    walletAddress: null,
    networkId: DEFAULT_NETWORK_ID,
    networkName: NetworkNameById[DEFAULT_NETWORK_ID],
    switchToNetworkId: DEFAULT_NETWORK_ID,
    isSocialLogin: false,
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
            }>
        ) => {
            const { networkId } = action.payload;

            state.networkId = networkId;
            state.networkName = NetworkNameById[networkId]?.toLowerCase();
        },
        switchToNetworkId: (
            state,
            action: PayloadAction<{
                networkId: Network;
            }>
        ) => {
            state.switchToNetworkId = action.payload.networkId;
        },
        updateIsSocialLogin: (state, action: PayloadAction<boolean>) => {
            state.isSocialLogin = action.payload;
        },
    },
});

const getWalletState = (state: RootState) => state[sliceName];
export const getNetworkId = (state: RootState) => getWalletState(state).networkId;
export const getSwitchToNetworkId = (state: RootState) => getWalletState(state).switchToNetworkId;
export const getWalletAddress = (state: RootState) => getWalletState(state).walletAddress;
export const getIsWalletConnected = createSelector(getWalletAddress, (walletAddress) => walletAddress != null);
export const getIsSocialLogin = (state: RootState) => getWalletState(state).isSocialLogin;

export const {
    updateNetworkSettings,
    switchToNetworkId,
    updateWallet,
    updateIsSocialLogin,
} = walletDetailsSlice.actions;

export default walletDetailsSlice.reducer;
