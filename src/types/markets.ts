import { ApexBetType, MarketStatus } from 'constants/markets';
import { Position, PositionName, Side } from '../constants/options';

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
    betType: ApexBetType;
    homePriceImpact: number;
    awayPriceImpact: number;
    drawPriceImpact?: number;
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

export type AMMSide = {
    quote: number;
    priceImpact: number;
};

export type AMMPosition = {
    sides: Record<Side, AMMSide>;
};

export type AvailablePerSide = {
    positions: Record<Position, { available: number; buyImpactPrice?: number }>;
};

export type MarketData = {
    address: string;
    gameDetails: GameDetails;
    positions: Record<Position, { sides: Record<Side, { odd: number | undefined }> }>;
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
    betType: ApexBetType;
    isApex: boolean;
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

export type AccountMarketTicketData = AccountMarketData & {
    position: number;
};

export type AccountMarketOpenBidData = AccountMarketData & {
    userPositions: number[];
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
};

export type Tags = TagInfo[];

export type SportsMap = Record<number, string>;

export type SportsTagsMap = Record<string, number[]>;

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
    account: string;
    amount: number;
    position: AccountPositionGraph;
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
};

export type MarketTransactions = MarketTransaction[];

export type ClaimTransaction = {
    id: string;
    account: string;
    amount: number;
    timestamp: number;
    caller: string;
    market: MarketData;
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
