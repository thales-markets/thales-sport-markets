import { QueryClient } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { StatusFilter } from 'enums/markets';
import { Network } from 'enums/network';
import { TicketMarket } from 'types/markets';

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

export const refetchProofs = (networkId: Network, markets: TicketMarket[]) => {
    const gameIds = markets.map((market) => market.gameId).join(',');
    const typeIds = markets.map((market) => market.typeId).join(',');
    const playerIds = markets.map((market) => market.playerProps.playerId).join(',');
    const lines = markets.map((market) => market.line).join(',');

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

export const refetchTicketLiquidity = (
    networkId: Network,
    isSystemBet: boolean,
    systemBetDenominator: number,
    isSgp: boolean,
    totalQuote: number,
    markets: TicketMarket[]
) => {
    const gameIds = markets.map((market) => market.gameId).join(',');
    const typeIds = markets.map((market) => market.typeId).join(',');
    const playerIds = markets.map((market) => market.playerProps.playerId).join(',');
    const lines = markets.map((market) => market.line).join(',');
    const positions = markets.map((market) => market.position).join(',');
    const lives = markets.map((market) => market.live).join(',');

    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TicketLiquidity(
            networkId,
            isSystemBet,
            systemBetDenominator,
            isSgp,
            totalQuote,
            gameIds,
            typeIds,
            playerIds,
            lines,
            positions,
            lives
        ),
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
