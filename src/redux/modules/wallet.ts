import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { getAddress } from 'utils/formatters/ethers';
import { RootState } from 'redux/rootReducer';
import { NetworkId } from 'types/network';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { NetworkNameById } from 'constants/network';

const sliceName = 'wallet';

type WalletSliceState = {
    walletAddress: string | null;
    networkId: NetworkId;
    networkName: string;
    switchToNetworkId: NetworkId; // used to trigger manually network switch in App.js
};

const initialState: WalletSliceState = {
    walletAddress: null,
    networkId: DEFAULT_NETWORK_ID,
    networkName: NetworkNameById[DEFAULT_NETWORK_ID],
    switchToNetworkId: DEFAULT_NETWORK_ID,
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
    },
});

const getWalletState = (state: RootState) => state[sliceName];
export const getNetworkId = (state: RootState) => getWalletState(state).networkId;
export const getSwitchToNetworkId = (state: RootState) => getWalletState(state).switchToNetworkId;
export const getWalletAddress = (state: RootState) => getWalletState(state).walletAddress;
export const getIsWalletConnected = createSelector(getWalletAddress, (walletAddress) => walletAddress != null);

export const { updateNetworkSettings, switchToNetworkId, updateWallet } = walletDetailsSlice.actions;

export default walletDetailsSlice.reducer;
