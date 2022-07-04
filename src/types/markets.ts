import { MarketStatus } from 'constants/markets';
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
    drawOdds: number;
    homeScore: number;
    awayScore: number;
    sport: string;
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
    available: number;
    quote: number;
    priceImpact: number;
};

export type AMMPosition = {
    sides: Record<Side, AMMSide>;
};

export type MarketData = {
    address: string;
    gameDetails: GameDetails;
    positions: Record<Position, { sides: Record<Side, { odd: number }> }>;
    tags: number[];
    homeTeam: string;
    awayTeam: string;
    maturityDate: number;
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
};

export type Tags = TagInfo[];

export type SportsMap = Record<number, string>;

export type SportsTagsMap = Record<string, number[]>;

export type AccountPosition = {
    market: string;
    position: number;
    isWithdrawn: boolean;
    isClaimed: boolean;
};

export type AccountPositions = AccountPosition[];

export type AccountPositionsMap = {
    [market: string]: AccountPosition;
};

export type MarketTransactionType = 'bid' | 'changePosition' | 'withdrawal' | 'claim';

export type MarketTransaction = {
    hash: string;
    type: MarketTransactionType;
    account: string;
    timestamp: number;
    amount: number | string;
    blockNumber: number;
    position: PositionName;
    market: string;
};

export type MarketTransactions = MarketTransaction[];

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
