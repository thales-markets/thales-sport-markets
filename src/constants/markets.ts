export enum GlobalFilterEnum {
    All = 'All',
    Disputed = 'Disputed',
    YourPositions = 'YourPositions',
    Claim = 'Claim',
    // History = 'History',
}

export enum SortDirection {
    NONE,
    ASC,
    DESC,
}

export enum MarketType {
    TICKET,
    OPEN_BID,
}

export const DEFAULT_SORT_BY = 1;

export const DEFAULT_POSITIONING_DURATION = 10 * 24 * 60 * 60 * 1000; // 10 days

export const MINIMUM_POSITIONS = 2;
export const MAXIMUM_POSITIONS = 5;
export const MAXIMUM_TAGS = 5;
export const MINIMUM_TICKET_PRICE = 10;
export const MAXIMUM_TICKET_PRICE = 1000;

export const DATE_PICKER_MAX_LENGTH_MONTHS = 1;
export const TODAYS_DATE = new Date();
export const DATE_PICKER_MIN_DATE = TODAYS_DATE; // today's date

const maxDate = new Date();
maxDate.setMonth(maxDate.getMonth() + DATE_PICKER_MAX_LENGTH_MONTHS);
export const DATE_PICKER_MAX_DATE = maxDate; // 2 month from now

export const MAXIMUM_INPUT_CHARACTERS = 200;

export enum MarketStatus {
    Open = 'open',
    CancelledPendingConfirmation = 'cancelled-pending-confirmation',
    CancelledDisputed = 'cancelled-disputed',
    CancelledConfirmed = 'cancelled-confirmed',
    Paused = 'paused',
    ResolvePending = 'resolve-pending',
    ResolvePendingDisputed = 'resolve-pending-disputed',
    ResolvedPendingConfirmation = 'resolved-pending-confirmation',
    ResolvedDisputed = 'resolved-disputed',
    ResolvedConfirmed = 'resolved-confirmed',
}

export enum DisputeVotingOption {
    ACCEPT_SLASH = 1,
    ACCEPT_NO_SLASH = 2,
    REFUSE_ON_POSITIONING = 3,
    ACCEPT_RESULT = 4,
    ACCEPT_RESET = 5,
    REFUSE_MATURE = 6,
}

export const DISPUTE_VOTING_OPTIONS_MARKET_OPEN = [
    DisputeVotingOption.ACCEPT_SLASH,
    DisputeVotingOption.ACCEPT_NO_SLASH,
    DisputeVotingOption.REFUSE_ON_POSITIONING,
];

export const DISPUTE_VOTING_OPTIONS_MARKET_RESOLVED = [
    DisputeVotingOption.ACCEPT_RESULT,
    DisputeVotingOption.ACCEPT_RESET,
    DisputeVotingOption.REFUSE_MATURE,
];

export const DISPUTE_VOTING_OPTIONS_TRANSLATION_KEYS = {
    [DisputeVotingOption.ACCEPT_SLASH]: 'market.dispute.voting-option.accept-slash',
    [DisputeVotingOption.ACCEPT_NO_SLASH]: 'market.dispute.voting-option.accept-no-slash',
    [DisputeVotingOption.REFUSE_ON_POSITIONING]: 'market.dispute.voting-option.refuse-on-positioning',
    [DisputeVotingOption.ACCEPT_RESULT]: 'market.dispute.voting-option.accept-result',
    [DisputeVotingOption.ACCEPT_RESET]: 'market.dispute.voting-option.accept-reset',
    [DisputeVotingOption.REFUSE_MATURE]: 'market.dispute.voting-option.refuse-mature',
};

export enum DisputeStatus {
    Open = 'open',
    AcceptedSlashed = 'accepted-slashed',
    AcceptedNotSlashed = 'accepted-not-slashed',
    RefusedOnPositioning = 'refused-on-positioning',
    AcceptedSetResult = 'accepted-set-result',
    AcceptedReset = 'accepted-reset',
    RefusedMature = 'refused-mature',
    Cancelled = 'cancelled',
}

export const DISPUTE_VOTED_OPTION_STATUS_MAP = {
    [DisputeVotingOption.ACCEPT_SLASH]: DisputeStatus.AcceptedSlashed,
    [DisputeVotingOption.ACCEPT_NO_SLASH]: DisputeStatus.AcceptedNotSlashed,
    [DisputeVotingOption.REFUSE_ON_POSITIONING]: DisputeStatus.RefusedOnPositioning,
    [DisputeVotingOption.ACCEPT_RESULT]: DisputeStatus.AcceptedSetResult,
    [DisputeVotingOption.ACCEPT_RESET]: DisputeStatus.AcceptedReset,
    [DisputeVotingOption.REFUSE_MATURE]: DisputeStatus.RefusedMature,
};

export const DISPUTE_STATUS_SORTING_MAP = {
    [DisputeStatus.Open]: 0,
    [DisputeStatus.AcceptedSlashed]: 1,
    [DisputeStatus.AcceptedNotSlashed]: 1,
    [DisputeStatus.AcceptedSetResult]: 1,
    [DisputeStatus.AcceptedReset]: 2,
    [DisputeStatus.RefusedMature]: 4,
    [DisputeStatus.RefusedOnPositioning]: 5,
    [DisputeStatus.Cancelled]: 6,
};
