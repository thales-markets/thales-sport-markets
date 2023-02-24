export type BracketMatch = {
    id: number;
    homeTeamId: number | undefined;
    awayTeamId: number | undefined;
    isHomeTeamSelected: boolean | undefined;
    homeTeamParentMatchId: number | undefined;
    awayTeamParentMatchId: number | undefined;
};

export type ResultMatch = {
    id: number;
    homeTeamId: number | undefined;
    awayTeamId: number | undefined;
    homeTeamScore: number;
    awayTeamScore: number;
    isResolved: boolean;

    // true - home team won; false - away team won; undefined - winner unknown;
    // Game could be unresolved and still to know thw winner if team drop out in previous rounds
    isHomeTeamWon: boolean | undefined;

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
