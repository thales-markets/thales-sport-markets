import { GameStatus, OddsType } from 'enums/markets';
import { Network } from '../enums/network';
import { League } from '../enums/sports';

export const ODDS_TYPES = [OddsType.AMERICAN, OddsType.AMM, OddsType.DECIMAL];

export const MIN_COLLATERAL_MULTIPLIER = 1.01;
export const APPROVAL_BUFFER = 0.01;

export const ALTCOIN_CONVERSION_BUFFER_PERCENTAGE = 0.02; // 2%

export const INCENTIVIZED_LEAGUES: Record<number, any> = {
    [League.UEFA_EURO]: {
        startDate: new Date(Date.UTC(2024, 5, 5, 0, 0, 0)),
        endDate: new Date(Date.UTC(2024, 6, 14, 23, 59, 59)),
        link: 'https://medium.com/@OvertimeMarkets.xyz/euro-2024-copa-america-reward-program-709efad25c38',
        tooltipKey: 'markets.incentivized-tooltip-euro-copa',
        availableOnNetworks: [Network.OptimismMainnet],
        rewards: {
            [Network.OptimismMainnet]: '20,000 OP',
        },
        showOnAllNetworks: Network.OptimismMainnet,
    },
    [League.COPA_AMERICA]: {
        startDate: new Date(Date.UTC(2024, 5, 5, 0, 0, 0)),
        endDate: new Date(Date.UTC(2024, 6, 14, 23, 59, 59)),
        link: 'https://medium.com/@OvertimeMarkets.xyz/euro-2024-copa-america-reward-program-709efad25c38',
        tooltipKey: 'markets.incentivized-tooltip-euro-copa',
        availableOnNetworks: [Network.OptimismMainnet],
        rewards: {
            [Network.OptimismMainnet]: '20,000 OP',
        },
        showOnAllNetworks: Network.OptimismMainnet,
    },
};

export const PARLAY_LEADERBOARD_WEEKLY_START_DATE = new Date(2024, 1, 14, 0, 0, 0);
// export const PARLAY_LEADERBOARD_WEEKLY_START_DATE_UTC = new Date(Date.UTC(2024, 1, 14, 0, 0, 0));

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
export const PARLAY_LEADERBOARD_MINIMUM_GAMES = 2;
export const HIDE_PARLAY_LEADERBOARD = false;

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
    [GameStatus.RUNDOWN_SCHEDULED]: 'scheduled',
    [GameStatus.RUNDOWN_PRE_FIGHT]: 'pre-fight',
    [GameStatus.RUNDOWN_FIGHTERS_WALKING]: 'fighters-walking',
    [GameStatus.RUNDOWN_FIGHTERS_INTRODUCTION]: 'fighters-introduction',
    [GameStatus.RUNDOWN_END_OF_ROUND]: 'end-of-round',
    [GameStatus.RUNDOWN_END_OF_FIGHT]: 'end-of-fight',
    [GameStatus.RUNDOWN_OVERTIME]: '',
    [GameStatus.ENETPULSE_FINISHED]: '',
    [GameStatus.ENETPULSE_INTERRUPTED]: 'interrupted',
    [GameStatus.ENETPULSE_CANCELED]: 'canceled',
};

export const BATCH_SIZE = 1000;
