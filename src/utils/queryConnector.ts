import QUERY_KEYS from 'constants/queryKeys';
import { QueryClient } from 'react-query';
import { LiquidityPoolType } from 'types/liquidityPool';
import { Network } from 'enums/network';

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
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.OvertimeVoucher(walletAddress, networkId));
};

export const refetchAfterClaim = (walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.ParlayMarkets(networkId, walletAddress));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.AccountPositions(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.ClaimableCount(walletAddress, networkId));
};

export const refetchAfterVoucherClaim = (walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.OvertimeVoucherEscrow(walletAddress, networkId));
};

export const refetchAfterMarchMadnessMint = (walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.MarchMadness.Data(walletAddress, networkId));
};

export const refetchVaultData = (vaultAddress: string, walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Vault.Data(vaultAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Vault.UserData(vaultAddress, walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Vault.PnL(vaultAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Vault.Trades(vaultAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Vault.UserTransactions(vaultAddress, networkId));
};

export const refetchLiquidityPoolData = (
    walletAddress: string,
    networkId: Network,
    liquidityPoolType: LiquidityPoolType
) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.LiquidityPool.Data(networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.LiquidityPool.ParlayData(networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.LiquidityPool.ParlayUserData(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.LiquidityPool.UserData(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.LiquidityPool.PnL(networkId, liquidityPoolType));
    queryConnector.queryClient.invalidateQueries(
        QUERY_KEYS.LiquidityPool.UserTransactions(networkId, liquidityPoolType)
    );
};

export default queryConnector;
