import { CACHE_PREFIX_KEYS, WAIT_PERIOD_AFTER_CACHE_INVALIDATION_IN_SECONDS } from 'constants/cache';
import QUERY_KEYS from 'constants/queryKeys';
import { Network } from 'enums/network';
import { QueryClient } from 'react-query';
import { LiquidityPoolType } from 'types/liquidityPool';
import { getCacheKey, invalidateCache, wait } from './cache';

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

export const refetchBalances = async (walletAddress: string, networkId: Network) => {
    await invalidateCache([getCacheKey(CACHE_PREFIX_KEYS.SportsMarkets.Vouchers, [networkId, walletAddress])]);

    await wait(WAIT_PERIOD_AFTER_CACHE_INVALIDATION_IN_SECONDS);

    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.GetsUSDWalletBalance(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.MultipleCollateral(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.OvertimeVoucher(walletAddress, networkId));
};

export const refetchAfterClaim = async (walletAddress: string, networkId: Network) => {
    await invalidateCache([
        getCacheKey(CACHE_PREFIX_KEYS.SportsMarkets.PositionBalance, [networkId, walletAddress]),
        getCacheKey(CACHE_PREFIX_KEYS.SportsMarkets.Parlay, [networkId, walletAddress]),
    ]);

    await wait(WAIT_PERIOD_AFTER_CACHE_INVALIDATION_IN_SECONDS);

    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.ParlayMarkets(networkId, walletAddress));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.AccountPositions(walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.ClaimableCount(walletAddress, networkId));
};

export const refetchAfterVoucherClaim = (walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Wallet.OvertimeVoucherEscrow(walletAddress, networkId));
};

export const refetchVaultData = (vaultAddress: string, walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Vault.Data(vaultAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Vault.UserData(vaultAddress, walletAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Vault.PnL(vaultAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Vault.Trades(vaultAddress, networkId));
    queryConnector.queryClient.invalidateQueries(QUERY_KEYS.Vault.UserTransactions(vaultAddress, networkId));
};

export const refetchLiquidityPoolData = async (
    walletAddress: string,
    networkId: Network,
    liquidityPoolType: LiquidityPoolType
) => {
    await invalidateCache([
        getCacheKey(CACHE_PREFIX_KEYS.SportsMarkets.LiquidityPoolTransactions, [
            networkId,
            liquidityPoolType,
            walletAddress,
        ]),
    ]);

    await wait(WAIT_PERIOD_AFTER_CACHE_INVALIDATION_IN_SECONDS);

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
