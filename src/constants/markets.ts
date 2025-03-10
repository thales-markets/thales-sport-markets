import { GameStatus, OddsType } from 'enums/markets';
import { Network } from 'enums/network';
import { League } from 'enums/sports';
import { NetworkId } from 'thales-utils';
import { SupportedNetwork } from 'types/network';

export const ODDS_TYPES = [OddsType.AMERICAN, OddsType.AMM, OddsType.DECIMAL];

export const APPROVAL_BUFFER = 0.01;
export const SWAP_APPROVAL_BUFFER = 0.03;

export const ALTCOIN_CONVERSION_BUFFER_PERCENTAGE = 0.025; // 2.5%
export const SUSD_CONVERSION_BUFFER_PERCENTAGE = 0.03; // 3%
export const COINGECKO_SWAP_TO_THALES_QUOTE_SLIPPAGE: Record<SupportedNetwork, number> = {
    [NetworkId.OptimismMainnet]: 0.03, // 3%
    [NetworkId.OptimismSepolia]: 0.03,
    [NetworkId.Arbitrum]: 0.1,
    [NetworkId.Base]: 0.1,
};

export const INCENTIVIZED_LEAGUES: Record<number, any> = {
    [League.MLB]: {
        startDate: new Date(Date.UTC(2024, 3, 8, 0, 0, 0)),
        endDate: new Date(Date.UTC(2024, 10, 1, 23, 59, 59)),
        link: 'https://www.overtimemarkets.xyz/promotions/mlb-nhl-rewards',
        tooltipKey: 'markets.incentivized-tooltip-nhl-mlb',
        availableOnNetworks: [Network.Arbitrum],
        rewards: {
            [Network.Arbitrum]: '30,000 ARB',
        },
    },
};

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
    [GameStatus.OPTICODDS_LIVE]: '',
    [GameStatus.OPTICODDS_HALF]: 'half-time',
    [GameStatus.OPTICODDS_UNPLAYED]: '',
    [GameStatus.OPTICODDS_COMPLETED]: '',
    [GameStatus.OPTICODDS_SUSPENDED]: 'suspended',
    [GameStatus.OPTICODDS_DELAYED]: 'delayed',
    [GameStatus.CANCELED]: 'canceled',
};

export const BATCH_SIZE = 10;

export const THALES_CONTRACT_RATE_KEY = 'THALES-CONTRACT';

export const THALES_ADDED_PAYOUT_PERCENTAGE = 0.02;

export const FUTURES_MAIN_VIEW_DISPLAY_COUNT = 2;

export const SYSTEM_BET_MINIMUM_MARKETS = 3;
export const SYSTEM_BET_MINIMUM_DENOMINATOR = 2;
export const SYSTEM_BET_MAX_ALLOWED_SYSTEM_COMBINATIONS = 10000;

export const NOT_AVAILABLE = 'N/A';
