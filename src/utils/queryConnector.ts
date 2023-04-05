import QUERY_KEYS from 'constants/queryKeys';
import { QueryClient } from 'react-query';
import { NetworkId } from 'types/network';

type QueryConnector = {
    queryClient: QueryClient;
    setQueryClient: () => void;
};

// @ts-ignore
const queryConnector: QueryConnector = {
    setQueryClient: function () {
        if (this.queryClient === undefined) {
            this.queryClient = new QueryClient();
        }
    },
};

export const refetchMarketData = (marketAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Market(marketAddress, networkId));
};

export const refetchMarkets = (networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.SportMarkets(networkId));
};

export const refetchBalances = (walletAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.GetsUSDWalletBalance(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.MultipleCollateral(walletAddress, networkId));
};

export const refetchAfterClaim = (walletAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.ParlayMarkets(networkId, walletAddress));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.AccountPositionsProfile(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.ClaimableCount(walletAddress, networkId));
};

export const refetchAfterVoucherMint = (walletAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.GetsUSDWalletBalance(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.MultipleCollateral(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.OvertimeVoucher(walletAddress, networkId));
};

export const refetchAfterVoucherClaim = (walletAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.OvertimeVoucherEscrow(walletAddress, networkId));
};

export const refetchAfterMarchMadnessMint = (walletAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.MarchMadness(walletAddress, networkId));
};

export default queryConnector;
