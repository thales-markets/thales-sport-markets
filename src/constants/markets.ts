import { BetType, ContractSGPOrder, OddsType, Position } from 'enums/markets';

export const ODDS_TYPES = [OddsType.AMM, OddsType.Decimal, OddsType.American];

export const MAX_USD_SLIPPAGE = 0.99;
export const APPROVAL_BUFFER = 0.01;

export const SGPCombinationsFromContractOrderMapping: Record<ContractSGPOrder, BetType[]> = {
    [ContractSGPOrder.MONEYLINETOTALS]: [0, 10002],
    [ContractSGPOrder.MONEYLINESPREAD]: [0, 10001],
    [ContractSGPOrder.SPREADTOTALS]: [10001, 10002],
};

export const INCENTIVIZED_LEAGUE = {
    ids: [9011, 9002],
    startDate: new Date(Date.UTC(2023, 7, 11, 0, 0, 0)),
    endDate: new Date(Date.UTC(2024, 4, 16, 23, 59, 59)),
    link:
        'https://medium.com/@OvertimeMarkets.xyz/get-ready-for-the-big-leagues-season-overtimes-biggest-reward-program-to-date-2d3949a06338',
    opRewards: '30,000 OP',
    arbRewards: '30, 000 ARB',
    thalesRewards: '30,000 THALES',
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

export const PARLAY_LEADERBOARD_OPTIMISM_REWARDS_TOP_10 = [250, 175, 125, 100, 85, 70, 60, 50, 45, 40];

export const PARLAY_LEADERBOARD_ARBITRUM_REWARDS_TOP_10 = [250, 175, 125, 100, 85, 70, 60, 50, 45, 40];

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

export const POSITION_TO_ODDS_OBJECT_PROPERTY_NAME: Record<Position, 'homeOdds' | 'awayOdds' | 'drawOdds'> = {
    0: 'homeOdds',
    1: 'awayOdds',
    2: 'drawOdds',
};

export const PARLAY_MAXIMUM_QUOTE = 0.01449275;
