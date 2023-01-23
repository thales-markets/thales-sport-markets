import { COLLATERALS_INDEX } from 'constants/currency';
import { MarketStatus } from 'constants/markets';
import { DoubleChanceMarketType } from 'constants/tags';
import { Position, PositionName } from '../constants/options';

export type MarketInfo = {
    address: string;
    creator: string;
    creationTime: number;
    resolver: string;
    resolvedTime: number;
    question: string;
    dataSource: string;
    isTicketType: boolean;
    endOfPositioning: number;
    ticketPrice: number;
    isWithdrawalAllowed: boolean;
    positions: string[];
    tags: number[];
    isOpen: boolean;
    numberOfDisputes: number;
    numberOfOpenDisputes: number;
    status: MarketStatus;
    marketClosedForDisputes: boolean;
    isResolved: boolean;
    isCancelled: boolean;
    winningPosition: number;
    backstopTimeout: number;
    isPaused: boolean;
    isDisputed: boolean;
    isMarketClosedForDisputes: boolean;
    canMarketBeResolved: boolean;
    canUsersClaim: boolean;
    disputeClosedTime: number;
    claimTimeoutDefaultPeriod: number;
    poolSize: number;
    numberOfParticipants: number;
    noWinners: boolean;
    cancelledByCreator: boolean;
};

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
};

export type FixedMarketData = {
    winningAmountsNewUser: number[];
    winningAmountsNoPosition: number[];
    winningAmountPerTicket: number;
};

export type GameDetails = {
    gameId: string;
    gameLabel: string;
};

export type AMMPosition = {
    available: number;
    quote: number;
    priceImpact: number;
};

export type AvailablePerPosition = Record<Position, { available?: number; buyBonus?: number }>;

export type AvailablePerDoubleChancePosition = Record<
    DoubleChanceMarketType,
    { available?: number; buyBonus?: number }
>;

export type DoubleChanceMarkets = Record<DoubleChanceMarketType, MarketData>;

export type DoubleChanceMarketsInfo = Record<DoubleChanceMarketType, SportMarketInfo>;

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
};

export type ChildMarkets = {
    spreadMarkets: MarketData[];
    totalMarkets: MarketData[];
    doubleChanceMarkets: MarketData[];
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

export type ParlayMarketWithRank = ParlayMarket & { rank: number; numberOfPositions: number };

export type PositionData = {
    id: string;
    market: SportMarketInfo;
    side: PositionName;
    claimable: boolean;
};

export type Markets = MarketInfo[];

export type SportMarkets = SportMarketInfo[];

export type AccountMarketData = {
    claimAmount: number;
    canClaim: boolean;
    winningAmount: number;
    canWithdraw: boolean;
    userAlreadyClaimedAmount: number;
};

export type SortOptionType = {
    id: number;
    title: string;
};

export type MarketsParameters = {
    fixedBondAmount: number;
    maximumPositionsAllowed: number;
    minimumPositioningDuration: number;
    creatorPercentage: number;
    resolverPercentage: number;
    safeBoxPercentage: number;
    withdrawalPercentage: number;
    paymentToken: string;
    creationRestrictedToOwner: boolean;
    owner: string;
    maxNumberOfTags: number;
    minFixedTicketPrice: number;
    maxFixedTicketPrice: number;
    marketQuestionStringLimit: number;
    marketSourceStringLimit: number;
    marketPositionStringLimit: number;
};

export type TagInfo = {
    id: number;
    label: string;
    logo?: string;
    logoClass?: string;
    favourite?: boolean;
    hidden?: boolean;
};

export type Tags = TagInfo[];

export type SportsMap = Record<number, string>;

export type SportsTagsMap = Record<string, number[]>;

export type SportsPeriodsMap = Record<number, string>;

export enum PositionType {
    home = 'home',
    away = 'away',
    draw = 'draw',
}

export type AccountPositionGraph = {
    id: string;
    market: SportMarketInfo;
    side: PositionType;
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

export type AccountPosition = AccountPositionGraph & {
    amount: number;
};

export type PositionBalances = PositionBalance[];

export type AccountPositionsMap = Record<string, AccountPosition[]>;

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

export type UserTransaction = {
    hash: string;
    type: MarketTransactionType;
    account: string;
    timestamp: number;
    amount: number | string;
    blockNumber: number;
    position: PositionName;
    positionTeam: string;
    market: string;
    game: string;
    result: PositionName;
    usdValue: number;
    isApexTopGame: boolean;
};

export type UserTransactions = UserTransaction[];

export type GamesOnDate = {
    date: string;
    numberOfGames: number;
};

export type Balances = {
    home: number;
    away: number;
    draw: number;
};

export type Odds = {
    home: number;
    away: number;
    draw: number;
};

export type ParlaysMarketPosition = {
    parentMarket: string;
    sportMarketAddress: string;
    position: Position;
    homeTeam: string;
    awayTeam: string;
    doubleChanceMarketType: DoubleChanceMarketType | null;
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
    selectedStableIndex: COLLATERALS_INDEX;
    isVoucherSelected: boolean | undefined;
    amountToBuy: number | string;
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
};
