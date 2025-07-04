import { GameStatus, LiveTradingFinalStatus, LiveTradingTicketStatus, StatusFilter } from 'enums/markets';
import { League, MarketType, Sport } from 'overtime-utils';
import { Coins } from 'thales-utils';
import { Network } from '../enums/network';

export type TagInfo = {
    id: League;
    label: string;
};

export type Tags = TagInfo[];

export type ParlayPayment = {
    selectedCollateralIndex: number;
    amountToBuy: number | string;
    networkId: Network;
    forceChangeCollateral: boolean;
};

type PlayerProps = {
    playerId: number;
    playerName: string;
};

export type CombinedPosition = {
    typeId: number;
    position: number;
    line: number;
    playerProps?: PlayerProps;
};

type CombinedPositions = CombinedPosition[];

export type SportMarketScore = {
    isGameFinished?: boolean;
    period?: number;
    gameStatus?: GameStatus;
    displayClock?: string;
    homeScore: number;
    awayScore: number;
    homeScoreByPeriod: number[];
    awayScoreByPeriod: number[];
};

export type SportMarket = {
    gameId: string;
    sport: Sport;
    initialSport?: Sport;
    leagueId: League;
    leagueName: string;
    subLeagueId: number;
    typeId: MarketType;
    type: string;
    maturity: number;
    apiMaturity?: number;
    maturityDate: Date;
    homeTeam: string;
    awayTeam: string;
    homeScore?: number | string;
    awayScore?: number | string;
    homeScoreByPeriod: number[];
    awayScoreByPeriod: number[];
    winningPositions: number[];
    status: number;
    isResolved: boolean;
    isOpen: boolean;
    isCancelled: boolean;
    isPaused: boolean;
    line: number;
    isOneSideMarket: boolean;
    isPlayerPropsMarket: boolean;
    isOneSidePlayerPropsMarket: boolean;
    isYesNoPlayerPropsMarket: boolean;
    playerProps: PlayerProps;
    odds: number[];
    proof: string[];
    childMarkets: SportMarket[];
    combinedPositions: CombinedPositions[];
    selectedCombinedPositions?: CombinedPositions;
    live?: boolean;
    gameClock?: number;
    gamePeriod?: string;
    tournamentName?: string;
    isGameFinished?: boolean;
    finishedTimestamp?: number;
    gameStatus?: GameStatus;
    liveScore?: SportMarketScore;
    positionNames?: string[];
    errorMessage?: string;
    numberOfMarkets?: number;
    pausedAt?: number;
    sgpSportsbooks?: string[];
};

type OmitDistributive<T, K extends PropertyKey> = T extends any
    ? T extends object
        ? Id<OmitRecursively<T, K>>
        : T
    : never;
type Id<T> = object & { [P in keyof T]: T[P] };
type OmitRecursively<T, K extends PropertyKey> = Omit<{ [P in keyof T]: OmitDistributive<T[P], K> }, K>;

// Omit all non-serializable values from SportMarket (maturityDate)
export type SerializableSportMarket = OmitRecursively<SportMarket, 'maturityDate'>;
export type SerializableTicketMarket = OmitRecursively<TicketMarket, 'maturityDate'>;

export type SportMarkets = SportMarket[];

export type MarketsCache = {
    [StatusFilter.OPEN_MARKETS]: SportMarkets;
    [StatusFilter.ONGOING_MARKETS]: SportMarkets;
    [StatusFilter.RESOLVED_MARKETS]: SportMarkets;
    [StatusFilter.PAUSED_MARKETS]: SportMarkets;
    [StatusFilter.CANCELLED_MARKETS]: SportMarkets;
};

export type TicketPosition = {
    gameId: string;
    leagueId: number;
    typeId: number;
    playerId: number;
    playerName: string;
    line: number;
    position: number;
    combinedPositions: CombinedPositions[];
    isOneSideMarket: boolean;
    isPlayerPropsMarket: boolean;
    homeTeam: string;
    awayTeam: string;
    playerProps: PlayerProps;
    live?: boolean;
};

export type TicketMarket = SportMarket & {
    position: number;
    odd: number;
    isWinning?: boolean;
};

export type SportsAmmData = {
    minBuyInAmount: number;
    maxTicketSize: number;
    maxSupportedAmount: number;
    maxSupportedOdds: number;
    safeBoxFee: number;
    maxAllowedSystemCombinations: number;
};

export type LiveTradingProcessor = {
    maxAllowedExecutionDelay: number;
};

export type TradeData = {
    gameId: string;
    sportId: number;
    typeId: number;
    maturity: number;
    status: number;
    line: number;
    playerId: number;
    odds: string[];
    merkleProof: string[];
    position: number;
    combinedPositions: CombinedPositions[];
};

export type SystemBetData = {
    systemBetDenominator: number;
    numberOfCombination: number;
    buyInPerCombination: number;
    minPayout: number;
    maxPayout: number;
    numberOfWinningCombinations: number;
};

export type Ticket = {
    id: string;
    timestamp: number;
    txHash: string;
    sportMarkets: TicketMarket[];
    collateral: Coins;
    account: string;
    buyInAmount: number;
    fees: number;
    totalQuote: number;
    payout: number;
    numOfMarkets: number;
    expiry: number;
    isResolved: boolean;
    isPaused: boolean;
    isCancelled: boolean;
    isLost: boolean;
    isUserTheWinner: boolean;
    isExercisable: boolean;
    isClaimable: boolean;
    isOpen: boolean;
    finalPayout: number;
    isLive: boolean;
    isSgp: boolean;
    isFreeBet: boolean;
    isSystemBet: boolean;
    systemBetData?: SystemBetData;
};

export type LiveTradingRequestRaw = {
    user: string;
    requestId: string;
    ticketId: string;
    isFulfilled: boolean;
    timestamp: number;
    maturityTimestamp: number;
    gameId: string;
    leagueId: League;
    typeId: MarketType;
    line: number;
    position: number;
    buyInAmount: number;
    expectedQuote: number;
    totalQuote: number;
    payout: number;
    collateral: Coins;
    status: LiveTradingTicketStatus;
    finalStatus: LiveTradingFinalStatus;
    errorReason: string;
};

export type LiveTradingRequest = LiveTradingRequestRaw & { ticket: TicketMarket };

export type TicketRequest = {
    initialRequestId: string;
    requestId: string;
    status: LiveTradingTicketStatus;
    finalStatus: LiveTradingFinalStatus;
    errorReason: string;
    ticket: SerializableTicketMarket;
    buyInAmount: number;
    totalQuote: number;
    payout: number;
    collateral: Coins;
};
type TicketRequestData = TicketRequest & {
    timestamp: number;
};
export type TicketMarketRequestData = TicketRequestData & {
    ticket: TicketMarket;
};
export type TicketRequestsById = Record<string, TicketRequestData>;

export type UserStats = {
    id: string;
    volume: number;
    trades: number;
    highestWin: number;
    lifetimeWins: number;
    pnl: number;
};

export type LpStats = {
    name: string;
    numberOfTickets: number;
    pnl: number;
    fees: number;
    pnlInUsd: number;
    feesInUsd: number;
};

export type LpUsersPnl = {
    account: string;
    pnl: number;
    pnlInUsd: number;
};

export type Team = {
    name: string;
    isHome: boolean;
};

export type Tournament = {
    leagueId: League;
    leageueName: string;
    name: string;
};

export type PositionStats = {
    position: number;
    buyIn: number;
    risk: number;
    pnlIfWin: number;
    isResolved: boolean;
    isWinning: boolean;
};

export type MarketStats = {
    id: string;
    market: TicketMarket;
    positionStats: PositionStats[];
    totalBuyIn: number;
};

export type GameStats = {
    totalValume: number;
    marketsStats: MarketStats[];
};

export type GameData = {
    tickets: Ticket[];
    gameStats: GameStats;
};
