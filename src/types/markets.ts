import { GameStatus, Position, StatusFilter } from 'enums/markets';
import { MarketType } from '../enums/marketTypes';
import { Network } from '../enums/network';
import { League, Sport } from '../enums/sports';
import { Coins } from './tokens';

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

export type CombinedPosition = { typeId: number; position: number; line: number };

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
    leagueId: League;
    leagueName: string;
    subLeagueId: number;
    typeId: MarketType;
    type: string;
    maturity: number;
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
    tournamentRound?: string;
    isGameFinished?: boolean;
    gameStatus?: GameStatus;
    liveScore?: SportMarketScore;
    positionNames?: string[];
};

type OmitDistributive<T, K extends PropertyKey> = T extends any
    ? T extends object
        ? Id<OmitRecursively<T, K>>
        : T
    : never;
type Id<T> = {} & { [P in keyof T]: T[P] };
type OmitRecursively<T, K extends PropertyKey> = Omit<{ [P in keyof T]: OmitDistributive<T[P], K> }, K>;

// Omit all non-serializable values from SportMarket (maturityDate)
export type SerializableSportMarket = OmitRecursively<SportMarket, 'maturityDate'>;

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
    position: Position;
    odd: number;
    isWinning?: boolean;
};

export type SportsAmmData = {
    minBuyInAmount: number;
    maxTicketSize: number;
    maxSupportedAmount: number;
    maxSupportedOdds: number;
    safeBoxFee: number;
};

export type LiveTradingProcessorData = {
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
    live?: boolean;
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
    isFreeBet: boolean;
};

export type UserStats = {
    id: string;
    volume: number;
    trades: number;
    highestWin: number;
    lifetimeWins: number;
};

export type Team = {
    name: string;
    isHome: boolean;
};
