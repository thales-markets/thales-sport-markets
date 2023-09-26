import Plausible from 'plausible-tracker';

export const PLAUSIBLE = Plausible({
    domain: 'overtimemarkets.xyz',
    trackLocalhost: true,
    apiHost: 'https://analytics-v2.thalesmarket.io',
});

// export const PLAUSIBLE_KEYS = {
//     depositLp: 'deposit-lp',
//     sellToAMM: 'amm-sell',
//     buyFromAMM: 'amm-buy',
//     buyFromRangeAMM: 'range-buy',
//     sellToRangeAMM: 'range-sell',
//     depositVaults: 'deposit-vaults',
// };
