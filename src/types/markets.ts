import { DisputeStatus, DisputeVotingOption, MarketStatus } from 'constants/markets';
import { Position, Side } from '../constants/options';

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

export type DisputeInfo = {
    id: string;
    timestamp: number;
    creationDate: number;
    disputeNumber: number;
    market: string;
    disputer: string;
    reasonForDispute: string;
    isInPositioningPhase: boolean;
    disputeCode: number;
    status: DisputeStatus;
    statusSortingIndex: number;
    isOpenForVoting: boolean;
};

export type Disputes = DisputeInfo[];

export type DisputeContractData = {
    timestamp: number;
    disputer: string;
    votedOption: number;
    reasonForDispute: string;
    isInPositioningPhase: boolean;
    isMarketClosedForDisputes: boolean;
    isOpenDisputeCancelled: boolean;
    disputeWinningPositionChoosen: number;
    firstMemberThatChooseWinningPosition: string;
    acceptResultVotesCount: number;
};

export type DisputeVoteInfo = {
    id: string;
    timestamp: number;
    market: string;
    dispute: number;
    voter: string;
    vote: number;
    position: number;
};

export type DisputeVotes = DisputeVoteInfo[];

export type DisputeVotingResultInfo = {
    votingOption: DisputeVotingOption;
    position: number;
    numberOfVotes: number;
};

export type DisputeVotingResults = DisputeVotingResultInfo[];

export type DisputeData = {
    disputeContractData: DisputeContractData;
    disputeVotes: DisputeVotes;
    disputeVotingResults: DisputeVotingResults;
    status: DisputeStatus;
    isOpenForVoting: boolean;
};

export type AccountDisputeData = {
    canDisputorClaimbackBondFromUnclosedDispute: boolean;
};

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
    position: string;
};

export type MarketTransactions = MarketTransaction[];

export type GamesOnDate = {
    date: string;
    numberOfGames: number;
};

export type Balances = {
    home: number;
    away: number;
    draw: number;
};
