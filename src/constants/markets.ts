import { CRYPTO_CURRENCY_MAP } from './currency';
import { BetType } from './tags';

export enum GlobalFiltersEnum {
    OpenMarkets = 'OpenMarkets',
    PendingMarkets = 'PendingMarkets',
    ResolvedMarkets = 'ResolvedMarkets',
    Canceled = 'Canceled',
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

export enum SportFilterEnum {
    Favourites = 'Favourites',
    All = 'All',
    Soccer = 'Soccer',
    Football = 'Football',
    Basketball = 'Basketball',
    Baseball = 'Baseball',
    Hockey = 'Hockey',
    MMA = 'MMA',
    Tennis = 'Tennis',
    eSports = 'eSports',
    Cricket = 'Cricket',
    Motosport = 'Motosport',
}

export const COLLATERALS = [
    CRYPTO_CURRENCY_MAP.sUSD,
    CRYPTO_CURRENCY_MAP.DAI,
    CRYPTO_CURRENCY_MAP.USDC,
    CRYPTO_CURRENCY_MAP.USDT,
];

export const DEFAULT_SORT_BY = 1;

export const DEFAULT_POSITIONING_DURATION = 10 * 24 * 60 * 60 * 1000; // 10 days

export const MINIMUM_POSITIONS = 2;
export const MAXIMUM_POSITIONS = 5;
export const MAXIMUM_TAGS = 5;
export const MINIMUM_TICKET_PRICE = 10;
export const MAXIMUM_TICKET_PRICE = 1000;

export const DATE_PICKER_MAX_LENGTH_MONTHS = 1;

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

export enum OddsType {
    American = 'american-odds',
    Decimal = 'decimal-odds',
    AMM = 'normalized-implied-odds',
}

export const ODDS_TYPES = [OddsType.AMM, OddsType.Decimal, OddsType.American];

export const MAX_TOKEN_SLIPPAGE = 0.995;
export const MAX_USD_SLIPPAGE = 0.99;
export const APPROVAL_BUFFER = 0.01;

export const APEX_GAME_MIN_TAG = 9100;

export enum ApexBetType {
    H2H = 0,
    TOP3 = 1,
    TOP5 = 2,
    TOP10 = 3,
}

export const ApexBetTypeKeyMapping = {
    [ApexBetType.H2H]: 'h2h',
    [ApexBetType.TOP3]: 'top3',
    [ApexBetType.TOP5]: 'top5',
    [ApexBetType.TOP10]: 'top10',
};

export enum ContractSGPOrder {
    MONEYLINETOTALS = 0,
    MONEYLINESPREAD = 1,
    SPREADTOTALS = 2,
}

export const SGPCombinationsFromContractOrderMapping: Record<ContractSGPOrder, BetType[]> = {
    [ContractSGPOrder.MONEYLINETOTALS]: [0, 10002],
    [ContractSGPOrder.MONEYLINESPREAD]: [0, 10001],
    [ContractSGPOrder.SPREADTOTALS]: [10001, 10002],
};

export enum ParlayErrorCode {
    NO_ERROS = 0,
    MAX_MATCHES = 1,
    SAME_TEAM_TWICE = 2,
    MAX_DOUBLE_CHANCES = 3,
    MAX_COMBINED_MARKETS = 4,
    MAX_NUMBER_OF_MARKETS_WITH_COMBINED_MARKETS = 5,
    SAME_RACE_DRIVERS = 6,
}

export const INCENTIVIZED_LEAGUE = {
    ids: [9004, 9006],
    startDate: new Date(Date.UTC(2023, 3, 11, 0, 0, 0)),
    endDate: new Date(Date.UTC(2023, 5, 30, 23, 59, 59)),
    link: 'https://dune.com/leifu/overtime-nhl-and-nba-playoff-campaign-11-apr-2023',
    opRewards: '20,000 OP',
    thalesRewards: '40,000 THALES',
};

export const INCENTIVIZED_GRAND_SLAM = {
    ids: [9153],
    startDate: new Date(Date.UTC(2023, 5, 30, 0, 0, 0)),
    endDate: new Date(Date.UTC(2023, 6, 16, 23, 59, 59)),
    link: 'https://dune.com/leifu/overtime-wimbledon-campaign-2003',
    opRewards: '5000 OP',
    arbRewards: '5000 ARB',
};

export const MIN_LIQUIDITY = 10;

export const PARLAY_LEADERBOARD_BIWEEKLY_START_DATE = new Date(2023, 2, 1, 0, 0, 0);
export const PARLAY_LEADERBOARD_BIWEEKLY_START_DATE_UTC = new Date(Date.UTC(2023, 2, 1, 0, 0, 0));

export const PARLAY_LEADERBOARD_FIRST_PERIOD_TOP_10_REWARDS = 6;

export const PARLAY_LEADERBOARD_OPTIMISM_REWARDS_TOP_20 = [
    300,
    200,
    150,
    115,
    100,
    95,
    90,
    80,
    70,
    65,
    60,
    55,
    50,
    48,
    46,
    45,
    44,
    40,
    38,
    36,
    35,
    34,
    32,
    30,
    28,
    26,
    25,
    22,
    21,
    20,
];

export const PARLAY_LEADERBOARD_ARBITRUM_REWARDS_TOP_20 = [
    750,
    500,
    375,
    286,
    250,
    238,
    225,
    200,
    175,
    162,
    150,
    138,
    125,
    120,
    115,
    113,
    110,
    100,
    95,
    90,
    87,
    85,
    80,
    75,
    70,
    65,
    63,
    55,
    53,
    50,
];

export const PARLAY_LEADERBOARD_OPTIMISM_REWARDS_TOP_10 = [625, 437.5, 312.5, 250, 212.5, 175, 150, 125, 112.5, 100];

export const PARLAY_LEADERBOARD_ARBITRUM_REWARDS_TOP_10 = [625, 437.5, 312.5, 250, 212.5, 175, 150, 125, 112.5, 100];

export const ENETPULSE_ROUNDS: Record<number, string> = {
    [0]: '',
    [1]: 'no round',
    [2]: 'Semi Finals',
    [3]: 'Quarter Finals',
    [4]: '1/8',
    [5]: '1/16',
    [6]: '1/32',
    [7]: '1/64',
    [8]: '1/128',
    [9]: 'Final',
};

export const COMBINED_MARKETS_CONTRACT_DATA_TO_POSITIONS: [0 | 1 | 2, 0 | 1][] = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
    [2, 0],
    [2, 1],
];
