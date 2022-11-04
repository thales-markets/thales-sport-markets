export const ROUTES = {
    Home: '/',
    Markets: {
        Home: '/markets',
        Market: '/markets/:marketAddress',
    },
    Rewards: '/rewards',
    Quiz: '/trivia',
    QuizLeaderboard: '/trivia/leaderboard',
    Vaults: '/vaults',
    Vault: '/vaults/:vaultId',
};
export default ROUTES;

export const RESET_STATE = 'reset';
