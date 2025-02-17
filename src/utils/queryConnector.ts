import { QueryClient } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { StatusFilter } from 'enums/markets';
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
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.Wallet.MultipleCollateral(walletAddress, networkId),
    });
};

export const refetchProofs = (
    networkId: Network,
    gameIds: string,
    typeIds: string,
    playerIds: string,
    lines: string
) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SportMarketsV2(
            StatusFilter.OPEN_MARKETS,
            networkId,
            true,
            gameIds,
            typeIds,
            playerIds,
            lines
        ),
    });
};

export const refetchFreeBetBalance = (walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.Wallet.FreeBetBalance(walletAddress, networkId),
    });
};

export const refetchAfterClaim = (walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ClaimableCountV2(walletAddress, networkId) });
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UserTickets(networkId, walletAddress) });
};

export const refetchLiquidityPoolData = (walletAddress: string, networkId: Network, liquidityPoolAddress: string) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LiquidityPool.Data(liquidityPoolAddress, networkId),
    });
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LiquidityPool.UserData(liquidityPoolAddress, walletAddress, networkId),
    });
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LiquidityPool.PnL(networkId, liquidityPoolAddress),
    });
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LiquidityPool.UserTransactions(networkId, liquidityPoolAddress),
    });
};

export const refetchOverdropMultipliers = (walletAddress: string) => {
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.Overdrop.UserMultipliers(walletAddress) });
};
export const refetchCoingeckoRates = () =>
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.Rates.CoingeckoRates() });

export const refetchResolveBlocker = (networkId: Network) => {
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ResolveBlocker.BlockedGames(true, networkId) });
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ResolveBlocker.BlockedGames(false, networkId),
    });
};

export const refetchAfterMarchMadnessMint = (walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MarchMadness.Data(walletAddress, networkId) });
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MarchMadness.Stats(networkId) });
};

export default queryConnector;
