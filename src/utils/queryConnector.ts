import { QueryClient } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { SpaceKey } from 'enums/governance';
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
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PositionsCountV2(walletAddress, networkId) });
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.UserTickets(networkId, walletAddress),
    });
};

export const refetchAfterBuy = (walletAddress: string, networkId: Network, gameId?: string) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.Wallet.MultipleCollateral(walletAddress, networkId),
    });
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PositionsCountV2(walletAddress, networkId) });
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LiveTradingProcessorData(networkId, walletAddress),
    });
    if (gameId)
        queryConnector.queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.OtherSingles(networkId, walletAddress, gameId),
        });
};

export const refetchUserLiveTradingData = (walletAddress: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.LiveTradingProcessorData(networkId, walletAddress),
    });
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
    isSgp: boolean,
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
            isSgp,
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

export const refetchGetFreeBet = (freeBetId: string, networkId: Network) => {
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FreeBet(freeBetId, networkId) });
};

export const refetchProposal = (spaceKey: SpaceKey, hash: string, walletAddress: string) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.Governance.Proposal(spaceKey, hash, walletAddress),
    });
};

export const refetchSpeedMarketsLimits = (networkId: Network, walletAddress?: string) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SpeedMarkets.SpeedMarketsLimits(networkId, walletAddress),
    });
};

export const refetchUserSpeedMarkets = (networkId: Network, walletAddress: string) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SpeedMarkets.UserSpeedMarkets(networkId, walletAddress),
    });
};

export const refetchUserResolvedSpeedMarkets = (networkId: Network, walletAddress: string) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SpeedMarkets.ResolvedSpeedMarkets(networkId, walletAddress),
    });
};

export const refetchActiveSpeedMarkets = (networkId: Network) => {
    queryConnector.queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SpeedMarkets.ActiveSpeedMarkets(networkId),
    });
};

export const refetchPythPrice = (priceId: string, publishTime: number) => {
    queryConnector.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.Prices.PythPrices(priceId, publishTime) });
};

export default queryConnector;
