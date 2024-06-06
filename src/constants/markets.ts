import { GameStatus, OddsType, Position } from 'enums/markets';
import { Network } from '../enums/network';
import { League } from '../enums/sports';

export const ODDS_TYPES = [OddsType.AMERICAN, OddsType.AMM, OddsType.DECIMAL];

export const MIN_COLLATERAL_MULTIPLIER = 1.01;
export const MAX_COLLATERAL_MULTIPLIER = 0.99;
export const APPROVAL_BUFFER = 0.01;

export const ALTCOIN_CONVERSION_BUFFER_PERCENTAGE = 0.05; // 5%

export const INCENTIVIZED_LEAGUES: Record<number, any> = {
    // TODO: left as example
    // [League.NBA]: {
    //     startDate: new Date(Date.UTC(2023, 7, 11, 0, 0, 0)),
    //     endDate: new Date(Date.UTC(2024, 4, 16, 23, 59, 59)),
    //     link:
    //         'https://medium.com/@OvertimeMarkets.xyz/get-ready-for-the-big-leagues-season-overtimes-biggest-reward-program-to-date-2d3949a06338',
    //     tooltipKey: 'markets.incentivized-tooltip',
    //     availableOnNetworks: [Network.OptimismMainnet, Network.Arbitrum],
    //     rewards: {
    //         [Network.OptimismMainnet]: '30,000 OP',
    //         [Network.Arbitrum]: '30,000 ARB',
    //     },
    // },
    // [League.MLB]: {
    //     startDate: new Date(Date.UTC(2024, 3, 8, 0, 0, 0)),
    //     endDate: new Date(Date.UTC(2024, 10, 1, 23, 59, 59)),
    //     link: 'https://www.overtimemarkets.xyz/promotions/mlb-nhl-rewards',
    //     tooltipKey: 'markets.incentivized-tooltip-nhl-mlb',
    //     availableOnNetworks: [Network.Arbitrum],
    //     rewards: {
    //         [Network.Arbitrum]: '30,000 ARB',
    //     },
    //     showOnAllNetworks: Network.Arbitrum,
    // },
    [League.UEFA_EURO_QUALIFICATIONS]: {
        startDate: new Date(Date.UTC(2024, 5, 5, 0, 0, 0)),
        endDate: new Date(Date.UTC(2024, 6, 14, 23, 59, 59)),
        link: 'https://v2.overtimemarkets.xyz/',
        tooltipKey: 'markets.incentivized-tooltip-euro',
        availableOnNetworks: [Network.OptimismMainnet],
        rewards: {
            [Network.OptimismMainnet]: '10,000 OP',
        },
        showOnAllNetworks: Network.OptimismMainnet,
    },
};

export const MIN_LIQUIDITY = 10;

export const PARLAY_LEADERBOARD_WEEKLY_START_DATE = new Date(2024, 1, 14, 0, 0, 0);
export const PARLAY_LEADERBOARD_WEEKLY_START_DATE_UTC = new Date(Date.UTC(2024, 1, 14, 0, 0, 0));

export const PARLAY_LEADERBOARD_OPTIMISM_REWARDS_TOP_20 = [
    100,
    75,
    50,
    35,
    30,
    25,
    25,
    20,
    20,
    20,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
    10,
];

export const PARLAY_LEADERBOARD_ARBITRUM_REWARDS_TOP_20 = [
    350,
    275,
    225,
    175,
    150,
    140,
    130,
    120,
    110,
    100,
    95,
    90,
    85,
    80,
    75,
    70,
    65,
    60,
    55,
    50,
];

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

export const POSITION_TO_ODDS_OBJECT_PROPERTY_NAME: Record<Position, 'homeOdds' | 'awayOdds' | 'drawOdds'> = {
    0: 'homeOdds',
    1: 'awayOdds',
    2: 'drawOdds',
};

export const PARLAY_MAXIMUM_QUOTE = 0.006666666666666;

export const PARLAY_LEADERBOARD_MINIMUM_GAMES = 2;
export const HIDE_PARLAY_LEADERBOARD = true;

export const MEDIUM_ODDS = 0.52;

export const GameStatusKey: Record<GameStatus, string> = {
    [GameStatus.RUNDOWN_FINAL]: '',
    [GameStatus.RUNDOWN_FULL_TIME]: '',
    [GameStatus.RUNDOWN_HALF_TIME]: 'half-time',
    [GameStatus.RUNDOWN_POSTPONED]: 'postponed',
    [GameStatus.RUNDOWN_CANCELED]: 'canceled',
    [GameStatus.RUNDOWN_DELAYED]: 'delayed',
    [GameStatus.RUNDOWN_RAIN_DELAY]: 'rain-delay',
    [GameStatus.RUNDOWN_ABANDONED]: 'abandoned',
    [GameStatus.RUNDOWN_OVERTIME]: '',
    [GameStatus.ENETPULSE_FINISHED]: '',
    [GameStatus.ENETPULSE_INTERRUPTED]: 'interrupted',
    [GameStatus.ENETPULSE_CANCELED]: 'canceled',
};
