import Plausible from 'plausible-tracker';

export const PLAUSIBLE = Plausible({
    domain: 'overtimemarkets.xyz',
    trackLocalhost: true,
    apiHost: 'https://analytics-v2.thalesmarket.io',
});

export const PLAUSIBLE_KEYS = {
    parlayBuy: 'parlay-buy',
    multiSingleBuy: 'multi-single-buy',
    singleBuy: 'single-buy',
    depositLp: 'deposit-lp',
    walletConnect: 'wallet-connect',
    submitReferralId: 'submit-referral-id',
};
