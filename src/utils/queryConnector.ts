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

export const refetchMarketData = (marketAddress: string, walletAddress: string, isSell?: boolean) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Market(marketAddress, !!isSell));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.AccountMarketTicketData(marketAddress, walletAddress));
};

export const refetchMarkets = (networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.SportMarkets(networkId));
};

export const refetchBalances = (walletAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.PaymentTokenBalance(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.GetsUSDWalletBalance(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.MultipleCollateral(walletAddress, networkId));
};

export const refetchAfterClaim = (walletAddress: string, networkId: NetworkId) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.ParlayMarkets(networkId, walletAddress));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.AccountPositionsProfile(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.ClaimableCount(walletAddress, networkId));
};

export default queryConnector;
