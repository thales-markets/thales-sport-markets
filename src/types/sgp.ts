export type SgpParams = {
    gameId: string;
    positions: number[];
    typeIds: number[];
    lines: number[];
    playerIds: number[];
};

type SgpQuoteData = {
    gameId: string;
    market: string;
    name: string;
    price: number;
};

export type SportsbookData = {
    error: string | null;
    missingEntries: SgpQuoteData[] | null;
    legs: SgpQuoteData[] | null;
    price: number | null;
    priceWithSpread: number | null;
    maxImpliedSupportedOdds?: number;
};

export type SgpData = {
    data: Record<string, SportsbookData> & { selectedSportsbook: SportsbookData };
};
