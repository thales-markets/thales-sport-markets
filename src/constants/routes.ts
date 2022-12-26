export const ROUTES = {
    Home: '/',
    Markets: {
        Home: '/markets',
        Market: '/markets/:marketAddress',
    },
    Profile: '/profile',
    Referral: '/referral',
    Rewards: '/rewards',
    Quiz: '/trivia',
    QuizLeaderboard: '/trivia/leaderboard',
    MintWorldCupNFT: '/mint-world-cup-nft',
    Wizard: '/wizard',
    Vaults: '/vaults',
    Vault: '/vaults/:vaultId',
    Leaderboard: '/parlay-leaderboard',
};
export default ROUTES;

export const RESET_STATE = 'reset';
