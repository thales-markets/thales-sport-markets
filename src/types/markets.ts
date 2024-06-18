import { BetType, DoubleChanceMarketType, Position, PositionName } from 'enums/markets';
import { ethers } from 'ethers';
import { Network } from '../enums/network';

export type SportMarketInfo = {
    id: string;
    address: string;
    gameId: string;
    maturityDate: Date;
    tags: number[];
    isOpen: boolean;
    isResolved: boolean;
    isCanceled: boolean;
    finalResult: number;
    poolSize: number;
    numberOfParticipants: number;
    homeTeam: string;
    awayTeam: string;
    homeOdds: number;
    awayOdds: number;
    drawOdds: number | undefined;
    homeScore: number | string;
    awayScore: number | string;
    sport: string;
    isApex: boolean;
    resultDetails: string;
    isPaused: boolean;
    leagueRaceName?: string;
    qualifyingStartTime?: number;
    arePostQualifyingOddsFetched: boolean;
    betType: number;
    homeBonus: number;
    awayBonus: number;
    drawBonus?: number;
    parentMarket: string;
    childMarkets: SportMarketInfo[];
    spread: number;
    total: number;
    doubleChanceMarketType: DoubleChanceMarketType | null;
    combinedMarketsData?: CombinedMarket[];
    isOneSideMarket: boolean;
    playerId: number | null;
    playerName: string | null;
    playerPropsLine: number | null;
    playerPropsType: number | null;
    playerPropsOutcome: number | null;
    playerPropsScore: number | null;
};

export type AMMPosition = {
    available: number;
    quote: number;
    priceImpact: number;
    usdQuote: number;
};

export type AvailablePerPosition = Record<Position, { available?: number; buyBonus?: number }>;

export type AvailablePerDoubleChancePosition = Record<
    DoubleChanceMarketType,
    { available?: number; buyBonus?: number }
>;

export type DoubleChanceMarketsInfo = Record<DoubleChanceMarketType, SportMarketInfo>;

type GameDetails = {
    gameId: string;
    gameLabel: string;
};
export type MarketData = {
    address: string;
    gameDetails: GameDetails;
    positions: Record<Position, { odd: number | undefined }>;
    tags: number[];
    homeTeam: string;
    awayTeam: string;
    maturityDate: number;
    resolved: boolean;
    cancelled: boolean;
    finalResult: number;
    gameStarted: boolean;
    homeScore?: number;
    awayScore?: number;
    leagueRaceName?: string;
    paused: boolean;
    betType: number;
    isApex: boolean;
    parentMarket: string;
    childMarketsAddresses: string[];
    childMarkets: MarketData[];
    spread: number;
    total: number;
    doubleChanceMarketType: DoubleChanceMarketType | null;
    isOneSideMarket: boolean;
    playerId: number | null;
    playerName: string | null;
    playerPropsLine: number | null;
    playerPropsType: number | null;
    playerPropsOutcome: number | null;
    playerPropsScore: number | null;
};

export type SportMarketChildMarkets = {
    spreadMarkets: SportMarketInfo[];
    totalMarkets: SportMarketInfo[];
    doubleChanceMarkets: SportMarketInfo[];
    strikeOutsMarkets: SportMarketInfo[];
    homeRunsMarkets: SportMarketInfo[];
    rushingYardsMarkets: SportMarketInfo[];
    passingYardsMarkets: SportMarketInfo[];
    receivingYardsMarkets: SportMarketInfo[];
    passingTouchdownsMarkets: SportMarketInfo[];
    oneSiderTouchdownsMarkets: SportMarketInfo[];
    fieldGoalsMadeMarkets: SportMarketInfo[];
    pitcherHitsAllowedMarkets: SportMarketInfo[];
    oneSiderGoalsMarkets: SportMarketInfo[];
    shotsMarkets: SportMarketInfo[];
    pointsMarkets: SportMarketInfo[];
    hitsRecordedMarkets: SportMarketInfo[];
    reboundsMarkets: SportMarketInfo[];
    assistsMarkets: SportMarketInfo[];
    doubleDoubleMarkets: SportMarketInfo[];
    tripleDoubleMarkets: SportMarketInfo[];
    receptionsMarkets: SportMarketInfo[];
    firstTouchdownMarkets: SportMarketInfo[];
    lastTouchdownMarkets: SportMarketInfo[];
    threePointsMadeMarkets: SportMarketInfo[];
};

export type ParlayMarket = {
    id: string;
    txHash: string;
    sportMarkets: SportMarketInfo[];
    sportMarketsFromContract: string[];
    positions: PositionData[];
    positionsFromContract: number[];
    marketQuotes: number[];
    account: string;
    totalAmount: number;
    sUSDPaid: number;
    sUSDAfterFees: number;
    totalQuote: number;
    skewImpact: number;
    timestamp: number;
    lastGameStarts: number;
    blockNumber: number;
    claimed: boolean;
    won: boolean;
};

export type ParlayMarketWithQuotes = ParlayMarket & { quotes: number[] };

export type ParlayMarketWithRank = ParlayMarket & {
    rank: number;
    numberOfPositions: number;
    points: number;
    isV2: boolean;
};
export type ParlayMarketWithRound = ParlayMarket & { round: number };

type PositionNameType = 'HOME' | 'AWAY' | 'DRAW';
export type PositionData = {
    id: string;
    market: SportMarketInfo;
    side: PositionNameType;
    claimable: boolean;
};

export type SportMarkets = SportMarketInfo[];

export type TagInfo = {
    id: number;
    label: string;
    logo?: string;
    logoClass?: string;
    favourite?: boolean;
    hidden?: boolean;
    priority?: number;
};

export type Tags = TagInfo[];

export type SportsMap = Record<number, string>;

export type SportsTagsMap = Record<string, number[]>;

export type CombinedMarketsPositionName =
    | '1&O'
    | '1&U'
    | 'H1&O'
    | 'H1&U'
    | 'X&O'
    | 'X&U'
    | '2&O'
    | '2&U'
    | 'H2&O'
    | 'H2&U'
    | '';

export type AccountPositionProfile = {
    sUSDPaid: number;
    id: string;
    account: string;
    amount: number;
    claimable: boolean;
    open: boolean;
    market: SportMarketInfo;
    side: PositionName;
};

type AccountPositionGraph = {
    id: string;
    market: SportMarketInfo;
    side: PositionName;
    claimable: boolean;
};

export type PositionBalance = {
    id: string;
    firstTxHash: string;
    account: string;
    amount: number;
    position: AccountPositionGraph;
    sUSDPaid: number;
};

export type MarketTransactionType = 'bid' | 'changePosition' | 'withdrawal' | 'claim' | 'buy' | 'sell';

export type MarketTransaction = {
    hash: string;
    type: MarketTransactionType;
    account: string;
    timestamp: number;
    amount: number | string;
    blockNumber: number;
    position: any;
    market: string;
    paid: number;
    wholeMarket: SportMarketInfo;
};

export type MarketTransactions = MarketTransaction[];

export type ClaimTransaction = {
    id: string;
    account: string;
    amount: number;
    timestamp: number;
    caller: string;
    market: SportMarketInfo;
};

export type ClaimTransactions = ClaimTransaction[];

export type ParlaysMarketPosition = {
    parentMarket: string;
    sportMarketAddress: string;
    position: Position;
    homeTeam: string;
    awayTeam: string;
    tags: number[];
    betType: number;
    doubleChanceMarketType: DoubleChanceMarketType | null;
    isOneSideMarket?: boolean;
    tag?: number;
    playerName?: string;
    playerId?: number;
    playerPropsType?: number;
};

export type CombinedMarketPosition = {
    markets: ParlaysMarketPosition[];
    totalOdd: number;
    totalBonus?: number;
    positionName: CombinedMarketsPositionName;
};

export type ParlaysMarket = SportMarketInfo & {
    position: Position;
    winning?: boolean;
};

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
    isVoucherAvailable: boolean;
    isVoucherSelected: boolean;
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

export type CombinedMarket = {
    markets: SportMarketInfo[];
    positions: Position[];
    totalOdd: number;
    totalBonus: number;
    positionName: CombinedMarketsPositionName | null;
};

export type CombinedParlayMarket = {
    markets: ParlaysMarket[];
    positions: Position[];
    totalOdd: number;
    totalBonus: number;
    positionName: CombinedMarketsPositionName | null;
};

export type CombinedMarketContractData = {
    mainMarket: string;
    combinedOdds: { odds: number[]; tags: number[] }[];
};

export type CombinedMarketsContractData = CombinedMarketContractData[];

export type SGPItem = { tags: number[]; combination: BetType[]; SGPFee: number };

type SGPContractDataItem = [number, number, number, number];

export type SGPContractData = SGPContractDataItem[];

export type LeaderboardPoints = {
    basicPoints: number;
    points: number;
    buyinBonus: number;
    numberOfGamesBonus: number;
};
