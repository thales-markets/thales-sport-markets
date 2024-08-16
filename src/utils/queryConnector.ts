import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { QueryClient } from 'react-query';

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

export const refetchBalances = (walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.GetsUSDWalletBalance(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.MultipleCollateral(walletAddress, networkId));
};

export const refetchFreeBetBalance = (walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.FreeBetBalance(walletAddress, networkId));
};

export const refetchAfterClaim = (walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.ParlayMarkets(networkId, walletAddress));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.AccountPositions(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.ClaimableCount(walletAddress, networkId));
};

export const refetchLiquidityPoolData = (walletAddress: string, networkId: Network, liquidityPoolAddress: string) => {
    // queryConnector.queryClient.invalidateQueries(QUERY_KEYS.LiquidityPool.Data(networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.LiquidityPool.ParlayData(networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.LiquidityPool.ParlayUserData(walletAddress, networkId));
    // queryConnector.queryClient.invalidateQueries(QUERY_KEYS.LiquidityPool.UserData(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.LiquidityPool.PnL(networkId, liquidityPoolAddress));
    queryConnector.queryClient.invalidateQueries(
        QUERY_KEYS.LiquidityPool.UserTransactions(networkId, liquidityPoolAddress)
    );
};

export const refetchCoingeckoRates = () =>
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Rates.CoingeckoRates());

export default queryConnector;
