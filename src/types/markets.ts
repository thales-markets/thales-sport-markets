import { GameStatus, Position, StatusFilter } from 'enums/markets';
import { ethers } from 'ethers';
import { Network } from '../enums/network';
import { League, Sport } from '../enums/sports';
import { Coins } from './tokens';

export type TagInfo = {
    id: number;
    label: string;
    logo?: string;
    logoClass?: string;
    favourite: boolean;
    priority: number;
    live: boolean;
};

export type Tags = TagInfo[];

export type SportsMap = Record<number, string>;

export type SportsTagsMap = Record<string, number[]>;

export type ParlayAmmData = {
    minUsdAmount: number;
    maxSupportedAmount: number;
    maxSupportedOdds: number;
    parlayAmmFee: number;
    safeBoxImpact: number;
    parlaySize: number;
};

export type ParlayPayment = {
    selectedCollateralIndex: number;
    amountToBuy: number | string;
    networkId: Network;
};

export type MultiSingleAmounts = {
    sportMarketAddress: string;
    parentMarketAddress: string;
    amountToBuy: number | string;
};

export type MultiSingleTokenQuoteAndBonus = {
    sportMarketAddress: string;
    isCombinedPosition?: boolean;
    tokenAmount: number;
    bonusPercentageDec: number;
    totalBonusCurrency: number;
    ammQuote: number | ethers.BigNumber;
};

export type WinningInfo = {
    highestWin: number;
    lifetimeWins: number;
};

export type SportMarketLiveResult = {
    homeScore: number;
    awayScore: number;
    period: number;
    status: string;
    scoreHomeByPeriod: number[];
    scoreAwayByPeriod: number[];
    displayClock: string;
    sportId: number;
    tournamentName?: string;
    tournamentRound?: string;
};

export type CombinedMarketContractData = {
    mainMarket: string;
    combinedOdds: { odds: number[]; tags: number[] }[];
};

export type LeaderboardPoints = {
    basicPoints: number;
    points: number;
    buyinBonus: number;
    numberOfGamesBonus: number;
};

export type PlayerProps = {
    playerId: number;
    playerName: string;
};

export type CombinedPosition = { typeId: number; position: number; line: number };

export type CombinedPositions = CombinedPosition[];

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
    typeId: number;
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
};

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
    live?: boolean;
};

export type BetTypeInfo = {
    name: string;
    title: string;
    showTooltip: boolean;
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
