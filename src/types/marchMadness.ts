export type MarchMadMatch = {
    id: number;
    homeTeamId: number | undefined;
    awayTeamId: number | undefined;
    isHomeTeamSelected: boolean | undefined;
    homeTeamScore: number;
    awayTeamScore: number;
    isResolved: boolean;
    isHomeTeamWon: boolean;
    homeTeamParentMatchId: number | undefined;
    awayTeamParentMatchId: number | undefined;
};

export type MarchMadTeam = {
    id: number;
    name: string;
    displayName: string;
    logo: string;
    region: string;
    position: number;
};
