import Plausible from 'plausible-tracker';

export const PLAUSIBLE = Plausible({
    domain: 'overtimemarkets.xyz',
    trackLocalhost: true,
    apiHost: 'https://analytics-v2.thalesmarket.io',
});

export const PLAUSIBLE_KEYS = {
    parlayBuy: 'parlay-buy',
    livePositionBuy: 'live-position-buy',
    sgpBuy: 'sgp-buy',
    depositLp: 'deposit-lp',
    freeBetLive: 'free-bet-live',
    binanceWalletBuy: 'binance-buy',
    farcasterBuy: 'farcaster-buy',
    speedMarketsBuy: 'speed-markets-buy',
};
