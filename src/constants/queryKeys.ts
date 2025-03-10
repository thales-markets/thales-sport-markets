import { StatusFilter } from 'enums/markets';
import { Network } from 'enums/network';
import { RiskManagementConfig, RiskManagementRole } from 'enums/riskManagement';
import { LiquidityPoolCollateral } from '../enums/liquidityPool';
import { League } from '../enums/sports';

const QUERY_KEYS = {
    Ticket: (networkId: Network, ticketAddress: string) => ['gameTickets', networkId, ticketAddress],
    GameTickets: (networkId: Network, gameId: string) => ['gameTickets', networkId, gameId],
    UserTickets: (networkId: Network, walletAddress: string) => ['userTickets', networkId, walletAddress],
    SportMarketsV2: (
        statusFilter: StatusFilter,
        networkId: Network,
        includeProofs: boolean,
        gameIds: string,
        typeIds: string,
        playerIds: string,
        lines: string
    ) => ['sportMarketsV2', statusFilter, networkId, includeProofs, gameIds, typeIds, playerIds, lines],
    LiveSportMarkets: (networkId: Network) => ['liveSportMarkets', networkId],
    SgpData: (networkId: Network, gameId: string, params: string) => ['sgpData', networkId, gameId, params],
    SportMarketSgp: (networkId: Network, gameId: string, params: string) => [
        'sportMarketSgp',
        networkId,
        gameId,
        params,
    ],
    SportMarketV2: (address: string, networkId: Network, isLive: boolean) => [
        'sportMarketV2',
        address,
        networkId,
        isLive,
    ],
    SportsAmmData: (networkId: Network) => ['sportsAmmData', networkId],
    SportsAmmRiskManager: (networkId: Network, league: League) => ['sportsAmmRiskManager', networkId, league],
    TicketLiquidity: (
        networkId: Network,
        isSystemBet: boolean,
        systemBetDenominator: number,
        isSgp: boolean,
        sgpQuote: number,
        gameIds: string,
        typeIds: string,
        playerIds: string,
        lines: string,
        positions: string,
        lives: string
    ) => [
        'ticketLiquidity',
        networkId,
        isSystemBet,
        systemBetDenominator,
        isSgp,
        sgpQuote,
        gameIds,
        typeIds,
        playerIds,
        lines,
        positions,
        lives,
    ],
    LiveTradingProcessorData: (networkId: Network) => ['liveTradingProcessorData', networkId],
    ClaimableCountV2: (walletAddress: string, networkId: Network) => ['claimable', 'countV2', walletAddress, networkId],
    Wallet: {
        MultipleCollateral: (walletAddress: string, networkId: Network) => [
            'multipleCollateral',
            walletAddress,
            networkId,
        ],
        FreeBetBalance: (walletAddress: string, networkId: Network) => ['freeBetBalance', walletAddress, networkId],
        StatsV2: (networkId: Network, walletAddress: string) => ['wallet', 'statsV2', networkId, walletAddress],
        LiquidityPoolTransactions: (networkId: Network, walletAddress: string) => [
            'wallet',
            'liquidityPoolTransactions',
            networkId,
            walletAddress,
        ],
        StakingData: (walletAddress: string, networkId: Network) => ['stakingData', walletAddress, networkId],
    },
    Pnl: {
        LpStats: (round: number, leagueId: League, onlyPP: boolean, networkId: Network) => [
            'pnl',
            'lpStats',
            round,
            leagueId,
            onlyPP,
            networkId,
        ],
        LpTickets: (
            lpCollateral: LiquidityPoolCollateral,
            round: number,
            leagueId: League,
            onlyPP: boolean,
            networkId: Network
        ) => ['pnl', 'lpTickets', lpCollateral, round, leagueId, onlyPP, networkId],
        LpUsersPnl: (
            lpCollateral: LiquidityPoolCollateral,
            round: number,
            leagueId: League,
            onlyPP: boolean,
            networkId: Network
        ) => ['pnl', 'lpUsersPnl', lpCollateral, round, leagueId, onlyPP, networkId],
    },
    ResolveBlocker: {
        BlockedGames: (isUnblocked: boolean, networkId: Network) => [
            'resolveBlocker',
            'blockedGames',
            isUnblocked,
            networkId,
        ],
        WhitelistedForUnblock: (walletAddress: string, networkId: Network) => [
            'resolveBlocker',
            'whitelistedForUnblock',
            networkId,
            walletAddress,
        ],
    },
    FavoriteTeam: (walletAddress: string, networkId: Network) => ['favoriteTeam', walletAddress, networkId],
    Banners: (networkId: Network) => ['banners', networkId],
    LiquidityPool: {
        Data: (address: string, networkId: Network) => ['liquidityPool', 'data', address, networkId],
        UserData: (address: string, walletAddress: string, networkId: Network) => [
            'liquidityPool',
            'data',
            address,
            walletAddress,
            networkId,
        ],
        PnL: (networkId: Network, liquidityPoolAddress: string) => [
            'liquidityPool',
            'pnl',
            liquidityPoolAddress,
            networkId,
        ],
        Return: (networkId: Network, liquidityPoolAddress: string) => [
            'liquidityPool',
            'return',
            liquidityPoolAddress,
            networkId,
        ],
        UserTransactions: (networkId: Network, liquidityPoolAddress: string) => [
            'liquidityPool',
            'userTransactions',
            liquidityPoolAddress,
            networkId,
        ],
    },
    CheckPausedAMM: (networkId: Network) => ['checkPausedAMM', networkId],
    Rates: {
        ExchangeRates: (networkId: Network) => ['rates', 'exchangeRates', networkId],
        CoingeckoRates: () => ['rates', 'coingeckoRates'],
    },
    Promotions: (branchName: string) => [branchName, 'promotions'],
    SeoArticles: (branchName: string) => ['seoArticles', branchName],
    Overdrop: {
        Leaderboard: () => ['leaderboard'],
        UserMultipliers: (walletAddress: string) => ['userMultipliers', walletAddress],
        UserData: (walletAddress: string) => ['userData', walletAddress],
        UserXPHistory: (walletAddress: string) => ['userXPHistory', walletAddress],
        GameMultipliers: () => ['gameMultipliers'],
        Price: () => ['price'],
    },
    RiskManagementConfig: (networkId: Network, configType: RiskManagementConfig) => [
        'riskManagementConfig',
        networkId,
        configType,
    ],
    WhitelistedAddress: (networkId: Network, walletAddress: string, role: RiskManagementRole) => [
        'whitelistedAddress',
        networkId,
        walletAddress,
        role,
    ],
};

export default QUERY_KEYS;
