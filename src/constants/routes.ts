export const ROUTES = {
    Home: '/',
    Markets: {
        Home: '/markets',
        Market: '/markets/:marketAddress',
    },
    Profile: '/profile',
    Referral: '/referral',
    Quiz: '/trivia',
    QuizLeaderboard: '/trivia/leaderboard',
    MintWorldCupNFT: '/mint-world-cup-nft',
    Wizard: '/wizard',
    Vaults: '/vaults',
    Vault: '/vaults/:vaultId',
    Leaderboard: '/parlay-leaderboard',
    MarchMadness: '/march-madness',
    LiquidityPool: '/liquidity-pool',
    SingleLiquidityPool: '/liquidity-pool?pool-type=single',
    ParlayLiquidityPool: '/liquidity-pool?pool-type=parlay',
};

export default ROUTES;

export const RESET_STATE = 'reset';
